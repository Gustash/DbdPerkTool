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
import { ApiNotification, PackQueryParams, User } from './ApiTypes';
import { ipcRenderer } from 'electron';

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
  private currentRawUser: string;
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

  async populateNotificationMethods(user: Partial<User>) {
    const apiInstance = this.executor?.apis?.default;
    if (!apiInstance) {
      return;
    }
    user.deleteAllNotifications = async () => {
      return apiInstance.deleteAllNotifications();
    };

    user.deleteNotification = async (notification: ApiNotification) => {
      return apiInstance.deleteNotification({ id: notification._id });
    };

    user.getNotifications = async (page?: number, limit?: number) => {
      return apiInstance.getUserNotifications({ page, limit });
    };

    user.getNumNotifications = async () => {
      const hasNotifications = await apiInstance.getUserHasNotifications();
      return hasNotifications.numNotifications;
    };

    user.markAllNotificationsRead = async () => {
      return apiInstance.clearUserNotifications();
    }

    user.markNotification = async (notification: ApiNotification, read: boolean) => {
      return apiInstance.markNotification({ id: notification._id }, {
        requestBody: {
          read
        }
      });
    };
  };

  async getUser(): Promise<User | null> {
    try {
      // @ts-ignore
      let user = await this.executor?.apis.default.getUser();

      // sometimes it seems like this returns the full resp and not just the body...
      if (!user.username && user.body) {
        user = user.body;
      }

      if (user.username) {
        if (JSON.stringify(user) !== this.currentRawUser) {
          this.currentRawUser = JSON.stringify(user);
          user.abilities = defineAbilitiesFor(user);
          this.populateNotificationMethods(user);
          user.numNotifications = await user.getNumNotifications();
          this.currentUser = user;
          log.info(`User logged in: ${user.username} - ${user.steamDisplayName}`);
        }
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
    this.currentRawUser = '';
    this.currentUser = null;
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
    const servers = ['https://app.dbdicontoolbox.com', 'https://dead-by-daylight-icon-toolbox.herokuapp.com'];
    for (let i = 0; i < servers.length; i++) {
      logger.info(`Attempting to communicate with server ${servers[i]}`)
      const server = servers[i];
      try {
        await axios.get(`${server}/spec`);
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
    const notif = await this.executor.apis.default.popNotification(settingsUtil.settings.lastNotificationRead ? { since: settingsUtil.settings.lastNotificationRead } : {});
    // Global notification
    if (notif) {
      return notif;
    }

    // // User notifications
    // if(!this.currentUser) {
    //   return;
    // }

    // await this.executor.apis.default.
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
    ipcRenderer.on('upload-progress', (_event: any, progress: number) => {
      onProgress(progress);
    });

    await this.getUser();
    try {
      const args = {
        sourceFile,
        // @ts-ignore
        token: this.executor.jwt.token,
        // @ts-ignore
        uploadUrl: settingsUtil.settings.uploadServer || await this.executor.apis.default.getUploadServer()
      };
      await ipcRenderer.invoke('upload-zip', args);
    } finally {
      ipcRenderer.removeAllListeners('upload-progress');
    }

  }
}

export default new Api();
