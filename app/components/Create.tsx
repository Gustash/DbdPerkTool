import React, { Component, useState, useEffect, useContext } from 'react';
import sizeOf from 'image-size';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import ProgressBar from 'react-bootstrap/ProgressBar';
import fs from 'fs-extra';
import PackDir from '../packdir/PackDir';
import PackGenerator from '../packgenerator/PackGenerator';
import PlainTextInput from './Form/PlainTextInput';
import ErrorModal from './ErrorModal';
import SuccessModal from './SuccessModal';
import log from 'electron-log';
import axios from 'axios';
import settingsUtil from '../settings/Settings';
import styled from 'styled-components';
import api from '../api/Api';
import UserContext from '../context/UserContext';
import NoAuthorProfile from './NoAuthorProfile';
import rimraf from 'rimraf';
import { promisify } from 'util';
import UploadAgreement from './UploadAgreement';
import { DefaultContainer } from './DefaultContainer';
import PreviewSelector from './PreviewSelector';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import CreationLog from './CreationLog';
import { Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { buildPackLabel, ParentSelector } from './ParentSelector';

axios.defaults.adapter = require('axios/lib/adapters/xhr.js');

const { dialog } = require('electron').remote;

type MyProps = {};

const CreateButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PreviewSelectorWrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
`

export default function Create(props: MyProps) {
  const [packDir, setPackDir] = useState('');
  const [errorModalShow, setErrorModalShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [uploadAgreementShow, setUploadAgreementShow] = useState(false);
  const [packs, setPacks] = useState([]);
  const [parentPack, setParent] = useState(undefined);
  const [previewImages, setPreviewImages] = useState<Array<string>>([]);
  const [customPreviewImages, setCustomPreviewImages] = useState<Array<string>>([]);
  const [hasPreviewBanner, setHasPreviewBanner] = useState(false);
  const userContext = useContext(UserContext);
  const [creationLogLines, setCreationLogLines] = useState<Array<string>>([]);
  const [isVariant, setIsVariant] = useState<boolean>(false);
  const [labeledPacks, setLabeledPacks] = useState([]);
  const {state} = useLocation();

  if (!userContext?.user?.author) {
    return <NoAuthorProfile />;
  }

  const appendToCreationLog = (lines: string | Array<string>) => {
    if (!Array.isArray(lines)) {
      lines = [lines];
    }
    const linesWithDate = lines.map(line => `${new Date().toISOString()}: ${line}`);
    setCreationLogLines(oldLines => [...oldLines, ...linesWithDate]);
    log.debug(lines);
  };

  const autoAuthor = userContext.user.abilities.cannot('manage', 'all');

  console.log(JSON.stringify(props));
  const initialId = state?.id;
  const disableInputs: boolean = !!initialId;

  const loadPacks = async () => {
    const packs = await api.getPacks({ light: true, mine: true });
    const defaultPack = await api.getPacks({ light: true, defaultOnly: true });
    const allPacks = [...packs.data, ...defaultPack.data].sort((a, b) => {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
    setPacks(allPacks);


    const packsWithLabels = allPacks.map(pack => {
      return buildPackLabel(pack);
    }).sort((a, b) => {
      return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
    });

    setLabeledPacks(packsWithLabels)

    if (!initialId) {
      setAuthor(userContext.user.author.name);
    }

  };

  const logUpdater = (logLine?: string) => {
    log.debug(logLine);
    const lines = logLine?.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines) {
      appendToCreationLog(lines);
    }
  }

  const handleInitialId = async () => {
    const pack = await api.getPack(initialId);
    if (pack) {
      setTitle(pack.name);
      setDescription(pack.description);
      setAuthor(pack.author);
      if(pack.parent) {
        setIsVariant(true);
        const parent = labeledPacks.find(p => p.id === pack.parent.id);

        if(parent) {
          setParent(parent);
        }
      }
    }
  };

  useEffect(() => {
    if(initialId) {
      handleInitialId();
    }
  }, [labeledPacks])

  useEffect(() => {
    loadPacks();
  }, []);

  const doCreate = async e => {
    appendToCreationLog('Beginning creation');
    if (api.needsToAcceptUploadAgreement()) {
      setUploadAgreementShow(true);
      return;
    }

    e?.preventDefault();

    const packDirModel = new PackDir(packDir, logUpdater);

    appendToCreationLog(`Validating directory '${packDirModel.dir}'`);
    const validationStatus = await packDirModel.validate();

    if (validationStatus.isValid === false) {
      setErrorText(validationStatus.failReason);
      setErrorModalShow(true);
      return;
    }
    setSaveProgress(0);
    setSaving(true);

    const generator = new PackGenerator(
      packDirModel,
      undefined,
      title,
      parentPack?.id,
      author ?? userContext.user.author.name,
      description,
      validationStatus.skipFiles
    );

    let outputZip;

    try {
      appendToCreationLog('Generating output zip');
      outputZip = await generator.generate(getPreviewImagesCombined(), hasPreviewBanner, (logLine?: string) => {
        const lines = logLine?.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines) {
          appendToCreationLog(lines);
        }
      });
      // This is just a little hack to update the JWT if necessary before the upload
      // The upload doesn't use swagger client, and I did not want to re-write the JWT refresh
      // logic
      appendToCreationLog('Output zip generated. Uploading...');
      await api.getUser();
      await api.uploadZip(outputZip, progress => {
        setSaveProgress(progress);
      });
      setSuccessText(
        `Your pack has been uploaded. If you're not a TrustedCreator, your pack will be visible once it's approved by a moderator. Zip has also been generated at ${outputZip}`
      );
      setSaving(false);
      setSuccessModalShow(true);
    } catch (e) {
      log.error(e);
      console.log(e);
      console.trace();
      let message = e?.toString() ?? 'Unknown error uploading pack';
      if (e.response?.data) {
        message = e.response.data;
      }
      appendToCreationLog(`Error uploading pack: ${message}`);
      appendToCreationLog(e);
      log.error(`Error uploading pack: `, e?.response ?? e);
      setErrorText(`Error generating or uploading Pack: ${message}`);
      setSaving(false);
      setErrorModalShow(true);
    } finally {
      if (outputZip && settingsUtil.get('deleteAfterUpload') === true) {
        const rmrf = promisify(rimraf);
        log.info(`Removing output zip ${outputZip}`);
        await rmrf(outputZip);
      }
    }
  };

  const handleFormChanged = async () => { };

  const doSetPackDir = async (newDir: string) => {
    const packDirModel = new PackDir(newDir, logUpdater);

    const validationStatus = await packDirModel.validate();

    if (validationStatus.isValid === false) {
      setErrorText(validationStatus.failReason);
      setErrorModalShow(true);
      return;
    }

    const generator = new PackGenerator(
      packDirModel,
      undefined,
      title,
      null,
      author ?? userContext.user.author.name,
      description,
      validationStatus.skipFiles
    );
    try {
      const images = await generator.getPreviewImages();
      log.info(`Setting preview images...`);
      setPreviewImages(images);
      setPackDir(newDir);
    } catch (e) {
      let message = JSON.stringify(e);

      if (e?.message) {
        message = e.message;

        if (e.message.startsWith('Could not find')) {
          message = 'Could not find enough files to generate preview. You must have either 4 perks or 4 portraits to upload a pack.'
        }
      }
      setErrorText(message);
      setErrorModalShow(true);
    }
  };

  const pickPackDir = async () => {
    const dir = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (!dir.canceled && dir.filePaths.length > 0) {
      doSetPackDir(dir.filePaths[0]);
    }
  };

  const pickPreviewImage = async (index: number) => {
    const file = await dialog.showOpenDialog({
      filters: [
        { name: "Images", extensions: ["png"] },
      ],
      properties: ["openFile"]
    });

    if (!file.canceled && file.filePaths.length > 0) {
      console.log(file.filePaths[0]);

      const imageBase64 = await fs.promises.readFile(file.filePaths[0], { encoding: 'base64' });
      const dimensions = sizeOf(Buffer.from(imageBase64, 'base64'));
      console.log(dimensions);

      if (!dimensions || !dimensions.width || !dimensions.height) {
        setErrorText('Error determining dimensions of preview image');
        setErrorModalShow(true);
        return;
      }

      const isWithinPerkOrPortraitDimensions = (dimensions: ISizeCalculationResult) => dimensions.width <= 512 && dimensions.height <= 512;
      const isBanner = (dimensions: ISizeCalculationResult) => dimensions.width <= 1200 && dimensions.height <= 300;

      if (!isWithinPerkOrPortraitDimensions(dimensions) && !isBanner(dimensions)) {
        setErrorText('Preview icons must be either <=512width * <=512height OR <=1200width * <=300height');
        setErrorModalShow(true);
        return;
      }

      let customImages = [...customPreviewImages];
      const encodedImage = `data:image/png;base64, ${imageBase64}`;

      if (isWithinPerkOrPortraitDimensions(dimensions)) {
        customImages[index] = encodedImage;
        setHasPreviewBanner(false);
      } else {
        setHasPreviewBanner(true);
        customImages = [encodedImage];
      }
      setCustomPreviewImages(customImages);
    }
  };

  const getPreviewImagesCombined = () => {
    if (hasPreviewBanner) {
      return customPreviewImages;
    }
    const images = [];
    for (let i = 0; i < previewImages.length; i++) {
      if (customPreviewImages[i]) {
        images.push(customPreviewImages[i]);
      } else {
        images.push(previewImages[i]);
      }
    }

    return images;
  };

  const errorModalTitle = 'Error generating pack';
  const errorModalText = errorText;
  const successModalTitle = 'Success';

  const packTitleInput = disableInputs ? (<PlainTextInput
    label="Title"
    disabled={true}
    value={title}
  />) : (<PlainTextInput
    label="Title"
    onInputChange={(text: string, event: Event) => {
      setTitle(text);
    }}
    onChange={async (selected: any) => {
      if (selected && selected.length > 0) {
        const targetPack = selected[0];
        if (!targetPack.customOption) {
          const fullPack = await api.getPack(targetPack.id);
          setTitle(fullPack.name);
          setDescription(fullPack.description);
          setAuthor(fullPack.author);
          if(fullPack.parent) {
            setIsVariant(true);
            setParent(labeledPacks.find(pack => pack.id === fullPack.parent.id));
          }
        } else {
          setTitle(targetPack.name);
        }


      }
    }}
    value={title}
    options={packs}
  />)

  return (
    <div>
      <DefaultContainer>
        <Form
          className="md-form"
          onSubmit={doCreate}
          onChange={handleFormChanged}
        >
          {packTitleInput}
          <Form.Group>
            <Form.Check
              type="checkbox"
              label="Is Variant"
              checked={isVariant}
              onChange={e => {
                setIsVariant(e.target.checked);
              }}
            />
          </Form.Group>
          {isVariant && <ParentSelector onSetParent={(parent: any) => setParent(parent)} packs={labeledPacks} defaultSelected={parentPack}/>}
          <PlainTextInput
            label="Description"
            onChange={e => {
              setDescription(e.target.value);
            }}
            value={description}
            disabled={disableInputs}
          />

          <PlainTextInput
            label="Author"
            onChange={e => {
              setAuthor(e.target.value);
            }}
            value={author}
            disabled={autoAuthor || disableInputs}
          />


          <Form.Group>
            <Row>
              <Form.Label column sm="5" className="field-label-text">
                Pack Directory Location
              </Form.Label>
            </Row>
            <Row>
              <Col sm="10">
                <Form.Control
                  type="plaintext"
                  value={packDir}
                  className="dbd-input-field"
                  onChange={async (e) => {
                    doSetPackDir(e.target.value);
                  }}
                />
              </Col>
              <Col>
                <Button variant="secondary" onClick={pickPackDir}>
                  Browse
                </Button>
              </Col>
            </Row>
          </Form.Group>

          <PreviewSelectorWrapper>
            <h3 className="field-label-text mb-2">Preview</h3>
            <PreviewSelector author={author} name={title} images={getPreviewImagesCombined()} handlePickImage={pickPreviewImage} />
          </PreviewSelectorWrapper>

          <CreateButtonWrapper>
            <Button variant="secondary" type="submit" className="mb-1">
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="mr-2"
                hidden={!saving}
              />
              Upload Pack
            </Button>
            {saving && (
              <ProgressBar now={saveProgress} label={`${saveProgress}%`} />
            )}
            <CreationLog lines={creationLogLines} />
          </CreateButtonWrapper>
        </Form>
      </DefaultContainer>
      <UploadAgreement
        show={uploadAgreementShow}
        onHide={() => setUploadAgreementShow(false)}
        onAgree={async () => {
          try {
            await api.acceptUploadAgreement()
            userContext.setUser(await api.getUser());
            setUploadAgreementShow(false);
            doCreate(undefined);
          }
          catch (e) {
            setUploadAgreementShow(false);
            setErrorText('Unknown error accepting upload agreement');
            setErrorModalShow(true);
          }
        }}
      />
      <ErrorModal
        title={errorModalTitle}
        text={errorModalText}
        show={errorModalShow}
        onHide={() => setErrorModalShow(false)}
      />
      <SuccessModal
        title={successModalTitle}
        text={successText}
        show={successModalShow}
        onHide={() => setSuccessModalShow(false)}
      />
    </div>
  );
}
