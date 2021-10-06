import React, { Component, useState, useContext } from 'react';
import { subject } from '@casl/ability';
import fs from 'fs-extra';
import log from 'electron-log';
import { DateTime } from 'luxon';
import path from 'path';
import { app, remote, shell } from 'electron';
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
import api from '../api/Api';
import UserContext from '../context/UserContext';
import AdminControls from './IconPack/AdminControls';
import { InstallPathNotFoundError } from '../models/IconPack';
import ApprovalControls from './IconPack/ApprovalControls';

type MyProps = {
  id: string;
  downloads: number;
  meta: any;
  onAuthorClick: any;
  setFilter: any;
  onError: any;
  onInstallComplete: any;
  viewMode: string;
  onModifyComplete: any;
};

export default function PortraitPack(props: MyProps) {
  const [saving, setSaving] = useState(false);
  const [showInstallOpts, setShowInstallOpts] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [installStage, setInstallStage] = useState('');
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
    } catch (e) {
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
    await doInstall(props.id, (stage: string) => {
      setInstallStage(stage);
    }, opts);
    setSaving(false);
  };

  const imageTag = props.meta.hasCustomPreviews ? 'preview' : 'portraits';
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

  if (props.viewMode === 'Compact') {
    cardBody = (
      <Card.Body>
        <b>Author:</b>{' '}
        <Author
          onClick={(name: string) => {
            props.onAuthorClick(name);
          }}
          name={props.meta.author}
        />
        <br />
        <b>Latest Chapter:</b>{' '}
        <LatestChapter
          name={props.meta.latestChapter}
          onClick={() => {
            props.setFilter(props.meta.latestChapter);
          }}
        />
        <Row className="mb-2">
          <Col>
            <b>Last Update:</b> {lastUpdateStr}
          </Col>
        </Row>
      </Card.Body>
    );
  }

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
            viewMode={props.viewMode}
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
          progressText={installStage}
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
