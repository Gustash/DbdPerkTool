import axios from 'axios';
import electron from 'electron';
import rimraf from 'rimraf';
import unzipper from 'unzipper';
import fs from 'fs-extra';
import path from 'path';
import log from 'electron-log';
import settingsUtil from '../settings/Settings';
import logger from 'electron-log';
import { promisify } from 'util';
import { PackMeta } from '../api/ApiTypes';

const { ipcRenderer: ipc } = require('electron-better-ipc');
const { ipcRenderer } = electron;

axios.defaults.adapter = require('axios/lib/adapters/http');

export class InstallPathNotFoundError extends Error {
  static TYPE = 'InstallPathNotFound';
  public type = 'InstallPathNotFound';
  constructor() {
    super('DBD Installation not found. Please go to the Settings tab and set your DBD Installation Path.');
  }
}

export abstract class IconPack {
  meta: PackMeta;
  static getTempDir = () => settingsUtil.get('packDownloadDir');
  constructor(meta: PackMeta) {
    this.meta = meta;
  }

  static async cleanTemp() {
    const rm = promisify(rimraf);
    logger.info(`Cleaning up temp directory ${IconPack.getTempDir()}`);
    await rm(IconPack.getTempDir());
    await fs.promises.mkdir(IconPack.getTempDir());
  }

  /**
   * Copy necessary files from extracted icon zip to their final destination
   * in the DBD game files
   *
   * @param sourcePath temporary path where icons are stored
   * @param destPath the DBD UI/Icons directory
   * @param opts options. currently only used in PerkPack implementation
   */
  abstract copyFilesTo(
    sourcePath: string,
    destPath: string,
    opts: any
  ): Promise<any>;

  /**
   * Persist the saved pack ID for the UI
   */
  abstract saveInstalledPackId(): Promise<any>;

  private async getZipUrl(): Promise<string> {
    const url = await axios.get(
      `${settingsUtil.get('targetServer')}/pack`,
      {
        params: {
          packId: this.meta.id
        }
      }
    );
    return url.data;
  }

  /**
   * Given a buffer of raw zip data, extract to a temporary directory
   * @returns temporary directory. Must be removed manually!
   */
  private async extractZip(zipPath: string) {
    const tmpDir = { name: path.resolve(IconPack.getTempDir(), `${Date.now()}_${this.replaceWindowsChars(this.meta.id)}`) };
    log.debug('Extracting zip from ' + zipPath);
    const d = await unzipper.Open.file(zipPath);
    log.debug('Zip open');
    await d.extract({ path: tmpDir.name, concurrency: 5 });
    log.debug('Extract complete');
    return tmpDir;
  }

  private replaceWindowsChars(str: string): string {
    return str.replace(/[\/\\,+$~%.':*?<>{}]/g, '_');
  }

  /**
   * Retrieve the raw zip data for the current pack
   * @param onProgress - optional. Called with an integer percentage as the download progresses
   * @returns Buffer of raw zip data
   */
  private async downloadZip(onProgress?: Function): Promise<{ name: string }> {
    const url = await this.getZipUrl();
    const zip = { name: path.resolve(IconPack.getTempDir(), `${Date.now()}_${this.replaceWindowsChars(this.meta.id)}.zip`) };

    ipcRenderer.on('downloadProgress', (event, progress) => {
      log.info(`Progress: ${progress}%`);
      onProgress?.(`Downloading ${progress.toFixed(2)}%`);
    });

    const error = await ipcRenderer.invoke('downloadFile', {
      outputLocation: zip.name,
      url
    });

    if (error) {
      ipcRenderer.removeAllListeners('downloadProgress');
      throw error;
    }

    ipcRenderer.removeAllListeners('downloadProgress');

    return zip;
  }

  /**
   * Download zip and extract it to a temporary directory
   * @param onProgress - optional. Called with an integer percentage as the download progresses
   * @returns temporary directory
   */
  private async downloadAndExtract(onProgress: Function = () => { }) {
    onProgress('Downloading...');
    log.debug('Downloading Zip');
    const zipPath = await this.downloadZip(onProgress);
    onProgress('Extracting...');
    log.debug('Extracting Zip');
    const extractDir = await this.extractZip(zipPath.name);
    log.debug(`Extracted to ${extractDir.name}`);
    return { zipPath, extractPath: extractDir };
  }

  /**
   * Perform main installation operation. Retrieve a zip, extract it, and copy files to DBD directory
   * @param onProgress - callback to be called for download progress
   * @param opts - options. currently only used in PerkPack implementation
   */
  async install(onProgress: Function, opts = {}) {
    const dbdPath = settingsUtil.settings.dbdInstallPath;

    if (dbdPath === '') {
      throw new InstallPathNotFoundError();
    }

    const dbdIconsPath = path.resolve(
      dbdPath,
      'DeadByDaylight',
      'Content',
      'UI',
      'Icons'
    );

    let paths: any;

    try {
      paths = await this.downloadAndExtract(onProgress);
      onProgress('Copying...');
      await this.copyFilesTo(`${paths.extractPath.name}/Pack`, dbdIconsPath, opts);
      await this.saveInstalledPackId();
    } catch (e) {
      log.error(`Error installing pack: ${e.message ?? e}`);
      throw e;
    } finally {
      if (paths?.extractPath) {
        try {
          logger.info(`Removing ${paths.extractPath.name}`);
          await fs.remove(paths.extractPath.name);
        } catch (e) {
          logger.error(`Error removing extract dir`, e);
          throw e;
        }
      }
      if (paths?.zipPath) {
        try {
          logger.info(`Removing ${paths.zipPath.name}`);
          await fs.remove(paths.zipPath.name);
        } catch (e) {
          logger.error(`Error removing extract zip`, e);
          throw e;
        }
      }
      log.info(`Done installing!`);
    }


  }
}
