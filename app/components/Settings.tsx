import React, { Component, useState, useEffect } from 'react';
import path from 'path';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Tooltip from 'react-bootstrap/Tooltip';
import styled from 'styled-components';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import FormCheck from 'react-bootstrap/FormCheck';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import settingsUtil from '../settings/Settings';
import PlainTextInput from './Form/PlainTextInput';
import log from 'electron-log';
import { app, remote, shell } from 'electron';
import Badge from './Badge';
import { DefaultContainer } from './DefaultContainer';

const mainWindow = remote.getCurrentWindow();

type MyProps = {};

const TooltipWrapper = styled.div`
  display: flex;
  align-items: center;
`;


function openLogs() {
  const logPath = path.resolve((app || remote.app).getPath('userData'), 'logs');
  shell.openExternal(logPath);
}

export default function Settings(props: MyProps) {
  const [installPath, setInstallPath] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [writePackToTxt, setWritePackToTxt] = useState(false);
  const [deleteZipAfterUpload, setDeleteZipAfterUpload] = useState(true);
  const [packDownloadPath, setPackDownloadPath] = useState('');

  const doSave = async () => {
    settingsUtil.settings.dbdInstallPath = installPath;
    settingsUtil.settings.autoUpdate = autoUpdate;
    settingsUtil.settings.writeToTxt = writePackToTxt;
    settingsUtil.settings.deleteAfterUpload = deleteZipAfterUpload;
    settingsUtil.settings.packDownloadDir = packDownloadPath;
    await settingsUtil.save();
  }

  const writePackTxtPath = path.resolve(
    (app || remote.app).getPath('userData'),
    'currentperkpack.txt'
  );
  const writePackTxtTooltipMsg = `Write current installed pack name and author to .txt file located at ${writePackTxtPath}`;

  const renderTooltip = props => (
    <Tooltip id="writepack-tooltip" {...props}>
      {writePackTxtTooltipMsg}
    </Tooltip>
  );

  const loadSettings = async () => {
    await settingsUtil.read();
    const { settings } = settingsUtil;
    setInstallPath(settings.dbdInstallPath);
    setAutoUpdate(settingsUtil.get('autoUpdate'));
    setWritePackToTxt(settingsUtil.get('writeToTxt'));
    setDeleteZipAfterUpload(settingsUtil.get('deleteAfterUpload'));
    setPackDownloadPath(settingsUtil.get('packDownloadDir'));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const openLink = (e: any) => {
    e.preventDefault();
    let link = e.target.href;
    shell.openExternal(link);
  }

  const installPathHelp = (<span>
    <p>This is the path that DBD is installed in. For a step-by-step guide, visit <a href="https://dbdicontoolbox.com/help#i-am-getting-an-error-asking-me-to-set-my-install-location-via-the-setting-tab-what-do-i-do" onClick={(e) => openLink(e)}>this guide on the DBD Icon Toolbox site!</a></p>
  </span>
  )

  const downloadPackPathHelp = (<span>
    <p>This is the path that packs are temporarily downloaded to on your computer for extraction. You likely do not need to change this. </p>
  </span>
  )

  const saveButtonValue = 'Save' + (unsaved ? '*' : '');
  return (
    <DefaultContainer>
      <Form
        className="md-form"
        onSubmit={async e => {
          e.preventDefault();
          log.info('Saving...');
          await doSave();
          setUnsaved(false);
        }}
        onChange={() => setUnsaved(true)}
      >
        <PlainTextInput
          label="Dead By Daylight Install Path"
          help={installPathHelp}
          value={installPath}
          pathPicker={true}
          onChange={e => {
            settingsUtil.settings['overrideInstallPath'] = true;
            setInstallPath(e.target.value)
          }}
        />
        <PlainTextInput
          label="Pack Download Path"
          help={downloadPackPathHelp}
          value={packDownloadPath}
          pathPicker={true}
          onChange={e => {
            setPackDownloadPath(e.target.value)
          }}
        />
        <Form.Group>
          <TooltipWrapper>
            <Form.Check
              type="checkbox"
              label="Write current pack to .txt"
              checked={writePackToTxt}
              onChange={e => {
                setWritePackToTxt(e.target.checked);
              }}
            />
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
              trigger={['click']}
            >
              <Badge className="fas fa-question-circle ml-2"></Badge>
            </OverlayTrigger>
          </TooltipWrapper>
        </Form.Group>
        <Form.Group>
          <Form.Check
            type="checkbox"
            label="Delete .zip after upload"
            checked={deleteZipAfterUpload}
            onChange={e => {
              setDeleteZipAfterUpload(e.target.checked);
            }}
          />
        </Form.Group>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Button variant="secondary" type="submit">
            {saveButtonValue}
          </Button>
          <Button
            variant="secondary"
            style={{ marginLeft: 'auto', marginRight: '3px' }}
            onClick={async () => {
              await settingsUtil.setDefaultSettings();
              await settingsUtil.save();
              loadSettings();
            }}
          >
            Reset to Default
          </Button>
          <Button
            variant="secondary"
            style={{ marginRight: '3px' }}
            onClick={() => openLogs()}
          >
            Open Logs
          </Button>
          <Button
            variant="secondary"
            style={{ marginRight: '3px' }}
            onClick={async () => {
              await mainWindow.webContents.session.clearCache();
              (app || remote.app).relaunch();
              (app || remote.app).exit();
            }}
          >
            Clear Cache (and restart)
          </Button>
        </div>
      </Form>
    </DefaultContainer>
  );
}
