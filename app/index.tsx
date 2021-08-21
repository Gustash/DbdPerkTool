import React, { Fragment } from 'react';
import { render } from 'react-dom';
import electron, { remote } from 'electron';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import settingsUtil from './settings/Settings';
import './app.global.css';
import axios from 'axios';
import logger from 'electron-log';
import api from './api/Api';
import {IconPack} from './models/IconPack';


const _setImmediate = setImmediate;
process.once('loaded', function() {
  global.setImmediate = _setImmediate;
});

process.traceProcessWarnings = true;

const store = configureStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

const mainWindow = remote.getCurrentWindow();

mainWindow.removeMenu();
// mainWindow.setIcon(__dirname + '/img/icon.ico');

// mainWindow.on('resize', () => {
//   const [width] = mainWindow.getSize();
//   const aspectRatio = 16 / 9;
//   const newHeight = Math.floor(width / aspectRatio);
//   mainWindow.setSize(width, newHeight);
// });

// Get latest version
axios.get;

mainWindow.webContents.session.clearCache(function() {
  //some callback.
});

document.addEventListener('DOMContentLoaded', async () => {
  logger.catchErrors({
    showDialog: false,
  });

  try {
    await settingsUtil.read();
    await IconPack.cleanTemp();
    const targetServer = settingsUtil.settings.targetServerOverride || await api.determineTargetServer();
    if(targetServer === null) {
      remote.dialog.showErrorBox("Error", "Unable to communicate with the DBD Toolbox Server!");
    } else {
      settingsUtil.settings.targetServer = targetServer;
      await settingsUtil.save();
    }
    await api.checkForPackChanges();
    await api.initialize();
  } catch(e) {
    logger.error(`Error initializing Icon Toolbox: ${e}`);
  }



  logger.info(`Target Server: ${settingsUtil.get('targetServer')}`);

  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
});
