import { promisify } from 'util';
import Registry from 'winreg';
import fs from 'fs';
import vdf from 'node-vdf';
import path from 'path';
import { remote } from 'electron';
import os from 'os';
import PlatformSupport from './PlatformSupport';

const readFileAsync = promisify(fs.readFile);

function isNumeric(num: any) {
  return !isNaN(num);
}

class Steam {
  static async getLibraryFolders() {
    const steamInstallPath = await Steam.getInstallPath();
    const libraryManifestFilePath = `${steamInstallPath}/steamapps/libraryfolders.vdf`;
    const manifestText = await readFileAsync(libraryManifestFilePath, 'utf8');
    const manifest = vdf.parse(manifestText);
    const folders = [path.resolve(`${steamInstallPath}`)];

    const libFolderKey = Object.keys(manifest).find(key => key.toLowerCase() === 'libraryfolders');

    if(libFolderKey) {
      Object.keys(manifest[libFolderKey]).forEach(folder => {
        if (isNumeric(folder)) {
          const steamPath = path.resolve(manifest[libFolderKey][folder].path ?? manifest[libFolderKey][folder]);
          if(steamPath && !folders.includes(PlatformSupport.normalizePath(steamPath))) {
            folders.push(PlatformSupport.normalizePath(steamPath));
          }
        }
      });
    }

    return folders ?? [];
  }

  static async getInstallPath() {
    if (os.platform() === 'linux') {
      return Steam._getInstallPathLinux();
    }

    let regKey = new Registry({
      hive: Registry.HKCU,
      key: '\\Software\\Valve\\Steam\\'
    });

    let getKeyValue = promisify(regKey.get.bind(regKey));

    try {
      const keyValue = await getKeyValue('SteamPath');
      return keyValue.value;
    } catch (e) {
      regKey = new Registry({
        hive: Registry.HKLM,
        key: '\\Software\\Valve\\Steam\\'
      });

      getKeyValue = promisify(regKey.get.bind(regKey));
      const keyValue = await getKeyValue('SteamPath');
      return keyValue.value;
    }
  }

  static _getInstallPathLinux() {
    // TODO: Support Flatpak
    const homeFolder = remote.app.getPath('home');
    return `${homeFolder}/.steam/steam`;
  }
}

export default Steam;
