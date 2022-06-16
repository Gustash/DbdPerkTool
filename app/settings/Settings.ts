import DeadByDaylight from '../steam/DeadByDaylight';
import electron from 'electron';
import log from 'electron-log';
import path from 'path';
import { default as fsWithCallbacks } from 'fs';
const fs = fsWithCallbacks.promises;

type SettingSchema = {
  dbdInstallPath: string;
  installedPack: string;
  installedPortraitPack: string;
  lastUpdate: string;
  autoUpdate: boolean;
  targetServer: string;
  writeToTxt: boolean;
  lastNotificationRead: string;
  uploadServer: any;
  deleteAfterUpload: boolean;
  overrideInstallPath: boolean;
  packDownloadDir: string;
  targetServerOverride?: string;
  uploadDryRun: boolean;
  useLocalServers: boolean;
};

class Settings {
  settingsPath: string;
  settings: SettingSchema;
  defaultSettings: SettingSchema;
  constructor() {
    this.settingsPath = path.resolve(
      (electron.app || electron.remote.app).getPath('userData'),
      'dbdPerkToolSettings.json'
    );
    log.info(`Settings Path: ${this.settingsPath}`);
    this.defaultSettings = {
      lastUpdate: '',
      deleteAfterUpload: true,
      dbdInstallPath: '',
      installedPack: '',
      installedPortraitPack: '',
      autoUpdate: false,
      lastNotificationRead: '',
      writeToTxt: false,
      targetServer: 'https://dead-by-daylight-icon-toolbox.herokuapp.com',
      uploadServer: null,
      packDownloadDir: path.resolve((electron.app || electron.remote.app).getPath('temp')),
      overrideInstallPath: false,
      uploadDryRun: false,
      useLocalServers: false,
    };
    this.settings = { ...this.defaultSettings };
  }

  get(key: keyof SettingSchema) {
    if (this.settings[key] === undefined || this.settings[key] === null) {
      log.info(`Returning default setting for key ${key}`)
      return this.defaultSettings[key];
    } else {
      return this.settings[key];
    }
  }

  async setDefaultSettings() {
    const dbd = new DeadByDaylight();
    let dbdPath = '';

    try {
      dbdPath = await dbd.getInstallPath();
    } catch (e) {
      dbdPath = '';
    }
    this.settings = { ...this.defaultSettings, dbdInstallPath: dbdPath };
  }

  async read() {
    try {
      const settings = await fs.readFile(this.settingsPath, 'utf8');
      this.settings = JSON.parse(settings);
      log.info(`Read settings: ${settings}`);
    } catch (e) {
      console.log(e);
      await this.setDefaultSettings();
      await this.save();
    }
  }

  async save() {
    log.info('Saving settings: ', this.settings);
    try {
      await fs.writeFile(
        this.settingsPath,
        JSON.stringify(this.settings, null, 2)
      );
      log.info('Settings saved');
    } catch(e) {
      log.error(`Error writing settings file: ${e}`);
    }
  }
}

// Settings singleton
export default new Settings();
