import SteamApp from './SteamApp';
import fs from 'fs-extra';
import logger from 'electron-log';
import path from 'path';
import PlatformSupport from './PlatformSupport';

const DEFAULT_DBD_DIRS = ['C:\\Program Files (x86)\\Steam\\steamapps\\common\\Dead by Daylight', 'C:\\Program Files\\Steam\\steamapps\\common\\Dead by Daylight']

export default class DeadByDaylight {
  private steamApp = new SteamApp(381210);
  constructor() {

  }

  private async checkFileExists(filepath: string): Promise<string | boolean> {
    return new Promise((resolve, reject) => {
      fs.access(filepath, fs.constants.F_OK, error => {
        if (error) {
          resolve(false);
        } else {
          resolve(filepath);
        }
      });
    });
  }

  public async tryTheUsualSuspects(): Promise<string> {
    for (let i = 0; i < DEFAULT_DBD_DIRS.length; i += 1) {
      const res = await this.checkFileExists(DEFAULT_DBD_DIRS[i]);

      if (res) {
        return res;
      }
    }

    return '';
  }

  async isValidDbdPath(dbdPath: string): Promise<boolean> {
    if(!dbdPath || dbdPath.trim().length === 0) {
      return false;
    }

    const dbdExePath = path.join(dbdPath, 'DeadByDaylight.exe');
    return fs.promises.access(dbdExePath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }

  public async getInstallPath() {
    let dbdPath = await this.steamApp.getInstallPath();

    if (!await this.isValidDbdPath(dbdPath)) {
      logger.info('DBD not found in registry. Checking generic paths');
      dbdPath = await this.tryTheUsualSuspects();

      if (await this.isValidDbdPath(dbdPath)) {
        logger.info('Found DBD path in generic location: ' + dbdPath);
      } else {
        logger.info('DBD not found in generic location');
      }
    } else {
      logger.info('DBD installation found in registry: ' + dbdPath);
    }

    if (dbdPath) {
      return PlatformSupport.normalizePath(dbdPath);
    }

    return null;
  }
}
