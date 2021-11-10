import copy from 'recursive-copy';
import log from 'electron-log';
import {IconPack} from './IconPack';
import settingsUtil from '../settings/Settings';
import { PackMeta } from '../api/ApiTypes';


export default class PerkPack extends IconPack {
  opts: any;
  constructor(meta: PackMeta) {
    super(meta);
  }

  async copyFilesTo(sourcePath: string, destPath: string, opts: any) {
    if (opts === undefined) {
      return copy(sourcePath, destPath, { overwrite: true });
    }
    // Create an object for faster lookup
    const desiredFilesObj: {[key: string]: boolean} = {};
    opts.forEach((file: string) => {
      desiredFilesObj[file] = true;
    });
    const filterFn = (src: String) => {
      if (!src || !src.endsWith('.png')) {
        return false;
      }
      const copying = desiredFilesObj[src.toLowerCase()] === true;
      // if(copying) {
      //   log.debug(`Copying File ${src}: ${copying}`);
      // }

      return copying;
    };

    log.debug('Desired Files: ', opts);
    log.debug(`Src Path: ${sourcePath} DestPath: ${destPath}`);

    await copy(sourcePath, destPath, { filter: filterFn, overwrite: true });
    log.debug('Copy complete...');
  }

  async saveInstalledPackId() {
    log.debug(`Saving installed pack: ${this.meta.id}`);
    settingsUtil.settings.installedPack = this.meta.id;
    await settingsUtil.save();
  }
}
