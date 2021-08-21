/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import electron, { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import ProgressBar from 'electron-progressbar';
import { EventEmitter } from 'events';
import axios from 'axios';
import fs from 'fs';
import fetch from 'electron-fetch';

axios.defaults.adapter = require('axios/lib/adapters/http');

const gotTheLock = app.requestSingleInstanceLock();
app.allowRendererProcessReuse = false;

let mainWindow: BrowserWindow | null = null;

export default class AppUpdater {
  constructor(win) {
    const currentUpdater = this;
    log.transports.file.level = 'info';
    log.catchErrors({
      showDialog: false
    });
    if (process.env.NODE_ENV === 'production') {
      autoUpdater.logger = log;
      autoUpdater.autoDownload = false;
      autoUpdater.checkForUpdates();
      autoUpdater.on('checking-for-update', () => {});
      autoUpdater.on('update-available', info => {
        ipcMain.on('update-available-resp', (event, doUpdate) => {
          if (doUpdate === true) {
            autoUpdater.downloadUpdate();
          }
        });
        win.webContents.send('update-available', info);
      });
      autoUpdater.on('update-not-available', info => {});
      autoUpdater.on('error', err => {});
      autoUpdater.signals.progress(progressObj => {
        log.info('Progress: ', progressObj);
        win.webContents.send('update-progress', progressObj);
      });
      autoUpdater.on('update-downloaded', info => {
        autoUpdater.quitAndInstall(false, true);
      });
    }
  }
}

process.traceProcessWarnings = true;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
            nodeIntegration: true
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js')
          }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater(mainWindow);
    ipcMain.on('downloadFile', async (event, args) => {
      log.info(`Downloading ${args.url} to ${args.outputLocation}`);
      try {
        fetch(args.url).then(res => {
          const dest = fs.createWriteStream(args.outputLocation);
          res.body.pipe(dest);
          dest.on('close', () => {
            log.info('Download complete!');
            mainWindow.webContents.send('downloadComplete');
          });
          dest.on('error', err => {
            log.error('Download error: ', err);
            mainWindow.webContents.send('downloadComplete', err);
          });
        });
      } catch (err) {
        log.error('Download error: ', err);
        mainWindow.webContents.send('downloadComplete', err);
      }
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
};

/**
 * Add event listeners...
 */

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
