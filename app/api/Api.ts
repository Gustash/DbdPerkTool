/* eslint-disable max-classes-per-file */
import { AbilityBuilder, Ability } from '@casl/ability';
import { remote } from 'electron';
import log from 'electron-log';
import settingsUtil from '../settings/Settings';
import Jwt from './Jwt';
import fs from 'fs-extra';
import logger from 'electron-log';
import axios from 'axios';
import ApiExecutor from './ApiExecutor';
import { PackQueryParams, User } from './ApiTypes';

const mainWindow = remote.getCurrentWindow();

axios.defaults.adapter = require('axios/lib/adapters/xhr.js');

function escapeRegex(str: string) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function defineAbilitiesFor(user: User) {
  const { can, rules } = new AbilityBuilder();

  if (user.role === 'Administrator') {
    can('manage', 'all');
  }

  if (user.role === 'Moderator') {
    can('update', 'UnmoderatedPacks');
    can('update', 'Users');
  }

  if (user.author && user.author.name) {
    can('manage', 'PerkPack', {
      author: { $regex: `^${escapeRegex((user.author || {}).name)}[ |+|&]?` }
    });
  }
  // @ts-ignore
  return new Ability(rules);
}

class Api {
  private currentUser: User | null = null;
  private executor: ApiExecutor | null = null;
  constructor() {
  }

  async initialize() {
    const targetServer = settingsUtil.get('targetServer');
    // @ts-ignore
    this.executor = await new ApiExecutor(`${targetServer}/spec`);
    await this.executor.initialize();
    // @ts-ignore
    this.executor.spec.servers[0].url = `${targetServer}/v2`;
    await this.getUser();
  }

  async getUser(): Promise<User | null> {
    try {
      // @ts-ignore
      let user = await this.executor?.apis.default.getUser();

      // sometimes it seems like this returns the full resp and not just the body...
      if(!user.username && user.body) {
        user = user.body;
      }
      
      if (user.username) {
        user.abilities = defineAbilitiesFor(user);
        this.currentUser = user;
        log.info(`User logged in: ${user.username} - ${user.steamDisplayName}`);
        return this.currentUser;
      }
    } catch (e) {
      log.info('User not logged in!', e);
      return null;
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null && this.currentUser !== undefined;
  }

  async setLoggedIn(jwtResp: any) {
    // @ts-ignore
    this.executor.setJwt(new Jwt(jwtResp), jwtResp.refreshToken);
    // @ts-ignore
    await this.executor.saveJwt();
    await this.getUser();
  }

  async exchangeCodeForJwt(code: string) {
    const url = `${settingsUtil.get('targetServer')}/auth/steam/finalize/${code}`;
    const resp = await axios.get(url);
    return resp.data;
  }

  async connectAuthor(steamId: string, authorName: string) {
    // @ts-ignore
    await this.executor.apis.default.connectProfile({}, { requestBody: { steamId, author: authorName } });
  }

  async updateFavorite(packId: string, newValue: boolean) {
    if (newValue) {
      // @ts-ignore
      await this.executor.apis.default.addFavorite({
        id: packId
      });
    } else {
      // @ts-ignore
      await this.executor.apis.default.deleteFavorite({
        id: packId
      });
    }
  }

  async getPacks(queryParams: PackQueryParams) {
    if (this.isLoggedIn()) {
      // @ts-ignore
      return this.executor.apis.default.getPacksSec(queryParams);
    } else {
      // @ts-ignore
      return this.executor.apis.default.getPacks(queryParams);
    }
  }

  // TODO define user query params
  async getUsers(queryParams: any) {
    // @ts-ignore
    return this.executor.apis.default.getUsers(queryParams);
  }

  async determineTargetServer(): Promise<string | null> {
    const servers = ['https://dead-by-daylight-icon-toolbox.herokuapp.com', 'http://app.dbdicontoolbox.com'];
    for (let i = 0; i < servers.length; i++) {
      logger.info(`Attempting to communicate with server ${servers[i]}`)
      const server = servers[i];
      try {
        logger.info(`Successfully communicated with server ${server}`)
        return server;
      } catch (e) {
        logger.info(`Error communicating with server ${server}`)
      }
    }
    return null;
  }

  async setLoggedOut() {
    this.currentUser = null;
    delete this.executor?.jwt;
    await this.executor?.deleteJwt();
  }

  async getPatrons() {
    // @ts-ignore
    return this.executor.apis.default.getPatrons();
  }

  async popNotification() {
    logger.debug('Popping notification');
    // @ts-ignore
    return this.executor.apis.default.popNotification(settingsUtil.settings.lastNotificationRead ? { since: settingsUtil.settings.lastNotificationRead } : {});
  }

  async checkForPackChanges() {
    const lastUpdate = await axios.get(
      `${settingsUtil.get('targetServer')}/lastUpdate`
    );

    if (lastUpdate.data !== settingsUtil.settings.lastUpdate) {
      logger.info('Clearing cache!');
      await mainWindow.webContents.session.clearCache();
      settingsUtil.settings.lastUpdate = lastUpdate.data;
      await settingsUtil.save();
      return lastUpdate.data;
    }

    return false;
  }

  async acceptUploadAgreement() {
    // @ts-ignore
    await this.executor.apis.default.putUser(
      {},
      {
        requestBody: {
          hasAcceptedUploadAgreement: true
        }
      }
    );
  }

  async setUserRole(username: string, role: string) {
    // @ts-ignore
    await this.executor.apis.default.putUser(
      {},
      {
        requestBody: {
          username,
          role
        }
      }
    );
  }

  async updateAuthorProfile(newProfile: any) {
    // @ts-ignore
    await this.executor.apis.default.putUser(
      {},
      {
        requestBody: {
          author: newProfile
        }
      }
    );
  }

  needsToAcceptUploadAgreement() {
    if (!this.currentUser) {
      return false;
    }
    return !this.currentUser.hasAcceptedUploadAgreement;
  }

  async approvePack(packId: string, all = false) {
    if (all) {
      // @ts-ignore
      return this.executor.apis.default.approvePack({}, { requestBody: { all: true } });
    } else {
      // @ts-ignore
      return this.executor.apis.default.approvePack({}, { requestBody: { id: packId } });
    }
  }

  async uploadZip(sourceFile: string, onProgress: (pct: number) => void) {
    const fileDetails = fs.statSync(sourceFile);

    if (fileDetails.size / 1000000.0 > 150) {
      throw Error('File is too large. Must be less than 150MB!');
    }

    const file = await fs.readFile(sourceFile);
    // This is just a little hack to update the JWT if necessary before the upload
    // The upload doesn't use swagger client, and I did not want to re-write the JWT refresh
    // logic
    await this.getUser();
    // @ts-ignore
    const uploadUrl = settingsUtil.settings.uploadServer || await this.executor.apis.default.getUploadServer();
    await axios.post(`${uploadUrl}/v2/packs`, file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        // @ts-ignore
        Authorization: `Bearer ${this.executor.jwt.token}`
      },
      onUploadProgress: progressEvent => {
        const totalLength = progressEvent.lengthComputable
          ? progressEvent.total
          : progressEvent.target.getResponseHeader('content-length') ||
          progressEvent.target.getResponseHeader(
            'x-decompressed-content-length'
          );
        console.log('onUploadProgress', totalLength);
        if (totalLength !== null) {
          onProgress(Math.round((progressEvent.loaded * 100) / totalLength));
        }
      }
    });
  }
}

export default new Api();
