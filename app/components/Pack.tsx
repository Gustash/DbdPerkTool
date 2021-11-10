import React, { useState, useContext } from 'react';
import { subject } from '@casl/ability';
import fs from 'fs-extra';
import log from 'electron-log';
import { DateTime } from 'luxon';
import path from 'path';
import { app, remote } from 'electron';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Has from './IconPack/PerkPack/Has';
import Details from './IconPack/PerkPack/Details';
import InstallOptionsModal from './IconPack/PerkPack/InstallOptionsModal';
import InstallButton from './IconPack/InstallButton';
import PerkPackModel from '../models/PerkPack';
import PackMetaMapper from '../models/PackMetaMapper';
import Author from './IconPack/Author';
import LatestChapter from './IconPack/LatestChapter';
import MainPreview from './IconPack/MainPreview';
import Title from './IconPack/Title';
import settingsUtils from '../settings/Settings';
import UserContext from '../context/UserContext';
import AdminControls from './IconPack/AdminControls';
import ApprovalControls from './IconPack/ApprovalControls';
import { InstallPathNotFoundError } from '../models/IconPack';

export enum PackType {
    Portraits,
    Perks
};

const IMAGE_TAG_FROM_TYPE: { [key in PackType]: string; } = {
    [PackType.Portraits]: 'portraits',
    [PackType.Perks]: 'perks'
}

type MyProps = {
  id: string;
  downloads: number;
  meta: any;
  onAuthorClick: any;
  setFilter: any;
  onError: (message: string, link ?: string) => void;
  onInstallComplete: any;
  onModifyComplete: any;
  approvalRequired: boolean;
  type: PackType;
};


export default function Pack(props: MyProps) {
  const [saving, setSaving] = useState(false);
  const [installState, setInstallState] = useState('');
  const [showInstallOpts, setShowInstallOpts] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const userContext = useContext(UserContext);

  const doInstall = async (id: string, progressCb: any, opts: any) => {
    log.debug(`Installing Pack ${id}`);
    const pack = new PerkPackModel(PackMetaMapper.fromRaw(props.meta));
    try {
      await pack.install(progressCb, opts);

      if (settingsUtils.settings.writeToTxt === true) {
        const writePackTxtPath = path.resolve(
          (app || remote.app).getPath('userData'),
          'currentperkpack.txt'
        );
        await fs.writeFile(
          writePackTxtPath,
          `Current Perk Pack: ${props.meta.author} - ${props.meta.name}`
        );
      }

      props.onInstallComplete(id);
    } catch (e: any) {
      let errorMessage = e.message || JSON.stringify(e);
      let link: string | undefined = undefined;
      if(e.type === InstallPathNotFoundError.TYPE) {
        link = 'https://dbdicontoolbox.com/help#i-am-getting-an-error-asking-me-to-set-my-install-location-via-the-setting-tab-what-do-i-do';
      }
      props.onError(`Error installing pack ${id}: ${errorMessage}`, link);
    }
  };

  const installPack = async (opts: Array<string>) => {
    setSaving(true);
    await doInstall(props.id, (state: string) => {
      setInstallState(state);
    }, opts);
    setSaving(false);
  };

  const imageTag = props.meta.hasCustomPreviews ? 'preview' : IMAGE_TAG_FROM_TYPE[props.type];
  const numImages = props.meta.hasPreviewBanner ? 1 : 4;

  const urls = [...Array(numImages).keys()].map(i => {
    return `${imageTag}_${i}.png`;
  });

  const lastUpdateStr = DateTime.fromISO(props.meta.lastUpdate).toRelative();

  let cardBody = (
    <Card.Body className="mb-0">
      <Row className="mb-2">
        <Col>
          <b>Author:</b>{' '}
          <Author
            onClick={(name: string) => {
              props.onAuthorClick(name);
            }}
            name={props.meta.author}
          />
        </Col>
        <Col>
          <b>Downloads:</b> {props.meta.downloads}
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <b>Latest Chapter:</b>{' '}
          <LatestChapter
            name={props.meta.latestChapter}
            onClick={() => {
              props.setFilter(props.meta.latestChapter);
            }}
          />
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <b>Last Update:</b> {lastUpdateStr}
        </Col>
      </Row>

      <Has
        perks={props.meta.hasPerks}
        portraits={props.meta.hasPortraits}
        powers={props.meta.hasPowers}
        items={props.meta.hasItems}
        statusEffects={props.meta.hasStatusEffects}
        addons={props.meta.hasItemAddOns}
        offerings={props.meta.hasFavors}
      />
    </Card.Body>
  );

  const featured = props.meta.featured ? 'pack-featured' : '';

  let adminButtons = null;
  let approvalButtons = null;

  if (
    userContext.user &&
    userContext.user.abilities.can('manage', subject('PerkPack', props.meta))
  ) {
    adminButtons = <AdminControls id={props.id} meta={props.meta} onModifyComplete={props.onModifyComplete} />;
  }

  if(userContext.user && userContext.user.abilities.can('update', 'UnmoderatedPacks') && !props.meta.approved) {
    approvalButtons = <ApprovalControls id={props.id} meta={props.meta} onModifyComplete={props.onModifyComplete}/>;
  }

  return (
    <div>
      <Card className={`${featured} ml-0 mr-0 text-center shadow perk-card perk-card-border`}>
        <Card.Body>
          <MainPreview
            urls={urls}
            id={props.id}
            baseUrl={props.meta.previewDir}
          />
        </Card.Body>
        <Title
          isApproved={props.meta.approved}
          name={props.meta.name}
          isFeatured={props.meta.featured}
          id={props.id}
        />
        {cardBody}
        <InstallButton
          installInProgress={saving}
          progressText={installState}
          onClick={() => {
            setShowInstallOpts(true);
          }}
        />
        <Button
          variant="secondary"
          className="m-1"
          onClick={() => {
            setShowDetails(true);
          }}
        >
          Details
        </Button>
        {adminButtons}
        {approvalButtons}
      </Card>
      <Details
        show={showDetails}
        onHide={() => setShowDetails(false)}
        id={props.id}
        meta={props.meta}
      />
      <InstallOptionsModal
        show={showInstallOpts}
        onConfirm={(opts: Array<string>) => {
          setShowInstallOpts(false);
          installPack(opts);
        }}
        onHide={() => setShowInstallOpts(false)}
        meta={props.meta}
      />
    </div>
  );
}
