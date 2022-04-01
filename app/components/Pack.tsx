import React, { useState, useContext } from 'react';
import { subject } from '@casl/ability';
import fs from 'fs-extra';
import log from 'electron-log';
import { DateTime } from 'luxon';
import path from 'path';
import { app, remote } from 'electron';
import { AccordionContext } from 'react-bootstrap';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
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
import { Accordion } from 'react-bootstrap';
import { PackVariants } from './PackVariants';

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
  onError: (message: string, link?: string) => void;
  onInstallComplete: any;
  onModifyComplete: any;
  approvalRequired: boolean;
  type: PackType;
};

type ContextAwareToggleProps = {
  children?: any;
  eventKey: string;
  callback?: any;
}

function ContextAwareToggle(props: ContextAwareToggleProps) {
  const accordionContext = useContext(AccordionContext);

  const decoratedOnClick = useAccordionToggle(
    props.eventKey,
    () => props.callback && props.callback(props.eventKey),
  );

  const isCurrentEventKey = accordionContext === props.eventKey;

  const icon = isCurrentEventKey ? <i className="fas fa-solid fa-angle-up"></i> : <i className="fas fa-solid fa-angle-down"></i>;

  return (
    <Button
      type="button"
      variant="secondary"
      className="btn-packvariant m-1"
      onClick={decoratedOnClick}
    >
      {icon} {props.children} {icon}
    </Button>
  );
}

export default function Pack(props: MyProps) {
  const [saving, setSaving] = useState(false);
  const [installState, setInstallState] = useState('');
  const [showInstallOpts, setShowInstallOpts] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsId, setDetailsId] = useState(props.id);
  const [detailsMeta, setDetailsMeta] = useState(props.meta);
  const [installId, setInstallId] = useState(props.id);
  const [installMeta, setInstallMeta] = useState(props.meta);
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
      if (e.type === InstallPathNotFoundError.TYPE) {
        link = 'https://dbdicontoolbox.com/help#i-am-getting-an-error-asking-me-to-set-my-install-location-via-the-setting-tab-what-do-i-do';
      }
      props.onError(`Error installing pack ${id}: ${errorMessage}`, link);
    }
  };

  const installPack = async (id: string, opts: Array<string>) => {
    setSaving(true);
    await doInstall(id, (state: string) => {
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
      {props.meta.parent && <Row className="mb-2">
        <Col>
        <b>Variant Of: </b><a
            href="#"
            onClick={e => {
              e.preventDefault();
              props.setFilter(props.meta.parent.id)
            }}
          >
            {props.meta.parent.author} - {props.meta.parent.name}
          </a>
        </Col>
      </Row>}
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

  if (userContext.user && userContext.user.abilities.can('update', 'UnmoderatedPacks') && !props.meta.approved) {
    approvalButtons = <ApprovalControls id={props.id} meta={props.meta} onModifyComplete={props.onModifyComplete} />;
  }

  return (
    <div>
      <Accordion flush>
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
            variantOf={props.meta.parent}
            id={props.id}
          />
          {cardBody}
          <InstallButton
            installInProgress={saving}
            progressText={installState}
            onClick={() => {
              setInstallId(props.id);
              setInstallMeta(props.meta);
              setShowInstallOpts(true);
            }}
          />
          <Button
            variant="secondary"
            className="m-1"
            onClick={() => {
              setDetailsId(props.id);
              setDetailsMeta(props.meta);
              setShowDetails(true);
            }}
          >
            Details
          </Button>
          {props.meta.children?.length > 0 && <ContextAwareToggle eventKey="0">
            Variants ({props.meta.children.length})
          </ContextAwareToggle>}
          <Accordion.Collapse eventKey="0">
            <Card.Body><PackVariants
              variants={props.meta.children}
              onVariantDetails={(id: string) => {
                setDetailsId(id);
                setDetailsMeta(props.meta.children.find((child: any) => child.id === id));
                setShowDetails(true);
              }}
              onVariantInstall={(id: string) => {
                setInstallId(id);
                setInstallMeta(props.meta.children.find((child: any) => child.id === id));
                setShowInstallOpts(true);
              }}
            /></Card.Body>
          </Accordion.Collapse>
          {adminButtons}
          {approvalButtons}
        </Card>
      </Accordion>
      <Details
        show={showDetails}
        onHide={() => setShowDetails(false)}
        id={detailsId}
        meta={detailsMeta}
      />
      <InstallOptionsModal
        show={showInstallOpts}
        onConfirm={(opts: Array<string>) => {
          setShowInstallOpts(false);
          installPack(installId, opts);
        }}
        onHide={() => setShowInstallOpts(false)}
        meta={installMeta}
      />
    </div>
  );
}
