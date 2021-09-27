import React, { Component, useState, useEffect, useContext } from 'react';
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
import PackMeta from '../models/PackMeta';
import settingsUtil from '../settings/Settings';
import styled from 'styled-components';
import api from '../api/Api';
import UserContext from '../context/UserContext';
import NoAuthorProfile from './NoAuthorProfile';
import rimraf from 'rimraf';
import { promisify } from 'util';
import UploadAgreement from './UploadAgreement';
import { DefaultContainer } from './DefaultContainer';

axios.defaults.adapter = require('axios/lib/adapters/xhr.js');

const { dialog } = require('electron').remote;

type MyProps = {};

const CreateButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

function replaceWindowsChars(str: string): string {
  return str.replace(/[\/\\,+$~%.':*?<>{}]/g, '_');
}

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
  const [allPacks, setAllPacks] = useState([]);
  const [parentPack, setParent] = useState(undefined);
  const userContext = useContext(UserContext);

  if (!userContext?.user?.author) {
    return <NoAuthorProfile />;
  }

  const autoAuthor = userContext.user.abilities.cannot('manage', 'all');

  const initialId = props.location?.state?.id;
  const disableInputs: boolean = !!initialId;

  const loadPacks = async () => {
    const packs = await api.getPacks({ light: true, mine: true });
    const allPacks = await api.getPacks({ light: true });
    setPacks(packs.data);
    setAllPacks(allPacks.data);

    if (initialId) {
      const pack = packs.data.find(pack => pack.id === initialId);
      if (pack) {
        setTitle(pack.name);
        setDescription(pack.description);
        setAuthor(pack.author);
      }
    }
  };

  useEffect(() => {
    loadPacks();
  }, []);

  const doCreate = async e => {

    if (api.needsToAcceptUploadAgreement()) {
      setUploadAgreementShow(true);
      return;
    }

    e?.preventDefault();
    const packDirModel = new PackDir(packDir);

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
      autoAuthor ? userContext.user.author.name : author,
      description,
      validationStatus.skipFiles
    );

    let outputZip;

    try {
      log.debug('Generating output zip');
      outputZip = await generator.generate();
      // This is just a little hack to update the JWT if necessary before the upload
      // The upload doesn't use swagger client, and I did not want to re-write the JWT refresh
      // logic
      log.debug('Output zip generated. Uploading...');
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
      console.log(e);
      console.trace();
      let message = 'Unknown error uploading pack';
      if (e.response?.data) {
        message = e.response.data;
      }
      log.debug(`Error uploading pack: `, e.response);
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

  const pickPackDir = async () => {
    const dir = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (!dir.canceled && dir.filePaths.length > 0) {
      setPackDir(dir.filePaths[0]);
    }
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
    onChange={(selected: any) => {
      if (selected && selected.length > 0) {
        const targetPack = selected[0];
        if (!targetPack.customOption) {
          setTitle(targetPack.name);
          setDescription(targetPack.description);
          setAuthor(targetPack.author);
        } else {
          setTitle(targetPack.name);
        }
      }
    }}
    value={title}
    options={packs.sort()}
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
          <PlainTextInput
            label="Parent"
            onChange={(selected: any) => {
              if (selected && selected.length > 0) {
                const targetPack = selected[0];
                setParent(targetPack);
              } else {
                setParent(undefined);
              }
            }}
            value={parentPack?.name}
            options={allPacks.sort()}
          />
          <PlainTextInput
            label="Description"
            onChange={e => {
              setDescription(e.target.value);
            }}
            value={description}
            disabled={disableInputs}
          />
          {!autoAuthor && (
            <PlainTextInput
              label="Author"
              onChange={e => {
                setAuthor(e.target.value);
              }}
              value={author}
              disabled={disableInputs}
            />
          )}

          <Form.Group>
            <Form.Row>
              <Form.Label column sm="5" className="field-label-text">
                Pack Directory Location
              </Form.Label>
            </Form.Row>
            <Form.Row>
              <Col sm="10">
                <Form.Control
                  type="plaintext"
                  value={packDir}
                  className="dbd-input-field"
                  onChange={e => {
                    setPackDir(e.target.value);
                  }}
                />
              </Col>
              <Col>
                <Button variant="secondary" onClick={pickPackDir}>
                  Browse
                </Button>
              </Col>
            </Form.Row>
          </Form.Group>

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
