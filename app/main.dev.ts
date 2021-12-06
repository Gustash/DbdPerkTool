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
import axios from 'axios';
import { FileDownloader } from './utils/FileDownloader';
import { IpcCommandHandler, registerIpcCommands } from './ipc-commands';
const { ipcMain: ipc } = require('electron-better-ipc');
const WIN32 = process.platform === 'win32';

axios.defaults.adapter = require('axios/lib/adapters/http');

const gotTheLock = app.requestSingleInstanceLock();
app.allowRendererProcessReuse = false;

let mainWindow: BrowserWindow | null = null;
let ipcHandler = new IpcCommandHandler();

let deeplinkingUrl;
let downloadInProgress = false;

const protocolLauncherArg = '--protocol-launcher';
const possibleProtocols = ['dbdicontoolbox'];

process.on('uncaughtException', function (err) {
  log.error(err);
})

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
      autoUpdater.on('checking-for-update', () => { });
      autoUpdater.on('update-available', info => {
        ipcMain.on('update-available-resp', (event, doUpdate) => {
          if (doUpdate === true) {
            autoUpdater.downloadUpdate();
          }
        });
        win.webContents.send('update-available', info);
      });
      autoUpdater.on('update-not-available', info => { });
      autoUpdater.on('error', err => { });
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

/**
 * Handle the url sent to this application
 * @param url the incoming url argument
 */
function handleAppURL(url: string) {
  log.info('Processing protocol url: ' + url);
  let action = url.split('://', 2)[1];
  if (action.endsWith('/')) {
    action = action.slice(0, action.length - 1);
  }
  // This manual focus call _shouldn't_ be necessary, but is for Chrome on
  // macOS. See https://github.com/desktop/desktop/issues/973.
  log.info(`Sending action!\n${JSON.stringify(action, null, 4)}`);
  if (mainWindow) {
    mainWindow.focus();
    mainWindow.show();
    mainWindow.webContents.send('url-action', action);
  }
}


/**
 * Attempt to detect and handle any protocol handler arguments passed
 * either via the command line directly to the current process or through
 * IPC from a duplicate instance (see makeSingleInstance)
 *
 * @param args Essentially process.argv, i.e. the first element is the exec
 *             path
 */
function handlePossibleProtocolLauncherArgs(args: ReadonlyArray<string>) {
  // log.info(`Received possible protocol arguments: ${args.length}`);

  if (WIN32) {
    // Desktop registers its protocol handler callback on Windows as
    // `[executable path] --protocol-launcher "%1"`. Note that extra command
    // line arguments might be added by Chromium
    // (https://electronjs.org/docs/api/app#event-second-instance).
    // At launch Desktop checks for that exact scenario here before doing any
    // processing. If there's more than one matching url argument because of a
    // malformed or untrusted url then we bail out.
    //
    // During development, there might be more args.
    // Strategy: look for the arg that is protocolLauncherArg,
    // then use the next arg as the incoming URL

    // Debugging:
    // args.forEach((v, i) => log.info(`argv[${i}] ${v}`));

    // find the argv index for protocolLauncherArg
    const flagI: number = args.findIndex((v) => v === protocolLauncherArg);
    if (flagI === -1) {
      // log.error(`Ignoring unexpected launch arguments: ${args}`);
      return;
    }
    // find the arg that starts with one of our desired protocols
    const url: string | undefined = args.find((arg) => {
      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < possibleProtocols.length; index++) {
        const protocol = possibleProtocols[index];
        if (protocol && arg.indexOf(protocol) === 0) {
          return true;
        }
      }
      return false;
    });
    if (url === undefined) {
      log.error(
        `No url in args even though flag was present! ${args.join('; ')}`
      );
      return;
    }
    handleAppURL(url);
    // End of WIN32 case
  } else if (args.length > 1) {
    // Mac or linux case
    handleAppURL(args[1]);
  }
}

/**
 * Wrapper around app.setAsDefaultProtocolClient that adds our
 * custom prefix command line switches on Windows.
 */
function setAsDefaultProtocolClient(protocol: string | undefined) {
  if (!protocol) {
    return;
  }
  if (
    WIN32 &&
    (process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true')
  ) {
    // Special handling on Windows while developing.
    // See https://stackoverflow.com/a/53786254/64904
    // remove so we can register each time as we run the app.
    app.removeAsDefaultProtocolClient(protocol);
    // Set the path of electron.exe and files
    // The following works for Electron v11.
    // Use the following console script to see the argv contents
    // process.argv.forEach((v, i)=> log.info(`argv[${i}] ${v}`));
    app.setAsDefaultProtocolClient(protocol, process.execPath, [
      process.argv[1], // -r
      path.resolve(process.argv[2]), // ./.erb/scripts/BabelRegister
      path.resolve(process.argv[3]), // ./src/main.dev.ts
      protocolLauncherArg,
    ]);
  } else if (WIN32) {
    app.removeAsDefaultProtocolClient(protocol);
    app.setAsDefaultProtocolClient(protocol, process.execPath, [
      protocolLauncherArg,
    ]);
  } else {
    app.removeAsDefaultProtocolClient(protocol);
    app.setAsDefaultProtocolClient(protocol);
  }
}

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

  app.on('open-url', function (event, url) {
    event.preventDefault();
    handleAppURL(url);
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

    ipcHandler.setMainWindow(mainWindow);
    ipcHandler.registerAll();

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater(mainWindow);
    
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
  app.on('second-instance', (_event, args) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }

      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }

      mainWindow.focus();
    }

    handlePossibleProtocolLauncherArgs(args);
  });
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => possibleProtocols.forEach((protocol) => setAsDefaultProtocolClient(protocol)));

app
  .whenReady()
  .then(createWindow)
  .catch((error) => {
    log.error(`error creating window: ${error}`);
  });
