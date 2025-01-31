import React, { Component, useState, useContext, useEffect } from 'react';
import path from 'path';
import electron from 'electron';
import styled from 'styled-components';
import routes from '../constants/routes.json';
import Image from 'react-bootstrap/Image';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import MenuEntry from './Nav/MenuEntry';
import api from '../api/Api';
import UserContext from '../context/UserContext';
import settingsUtil from '../settings/Settings';
import ConfirmationModal from './ConfirmationModal';
import Social from './Social';

import ToolboxLogo from '../img/toolbox-logo.png';
import UserImage from '../img/user.png';
import MenuDefaultImage from '../img/menu_default.png';
import MenuProfile from '../img/menu_profile.png';
import SantaHat from '../img/santa_hat.png';
import MenuAbout from '../img/menu_about.png';
import MenuAdd from '../img/menu_add.png';
import MenuPerk from '../img/menu_perk.png';
import MenuMyPacks from '../img/menu_mypacks.png';
import MenuSettings from '../img/menu_settings.png';
import MenuSignOut from '../img/menu_sign_out.png';
import MenuSignIn from '../img/menu_sign_in.png';
import MenuNotifications from '../img/menu_notifications.png';
import MenuAdmin from '../img/menu_admin.png';
import MenuVote from '../img/menu_vote.png';
import MenuFeatured from '../img/menu_featured.png';

import logger from 'electron-log';

const { BrowserWindow, app } = electron.remote;

const NavContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
  padding-left: 10px;
  background: rgba(0, 0, 0, 0.5);
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const UserProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  margin-bottom: 8px;
  text-align: center;
`;

const SignInWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const BottomEntries = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: auto;
`;

const LogoLabel = styled.p`
  text-align: center;
`;

const RefreshWrapper = styled.div`
  padding-left: 8px;
  padding-right: 8px;
  display: flex;
  margin-left: auto;
  margin-right: auto;
  margin-bottom:10px;
`;

const RefreshIconWrapper = styled.span`
  color: #d4af37;
  margin-right: 4px;

  &:hover {
    color: yellow;
    cursor: pointer;
  }
`;

const AccessoryWrapper = styled.div`
  position: relative;
  top: 0;
  left: 0;
`;

async function signIn(onJwt) {
  const preloadPath = path.join(app.getAppPath(), 'dist', 'SideNavPreload.js');
  logger.info(preloadPath);
  const authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    //frame: false,
    autoHideMenuBar: true,
    'web-security': false,
    webPreferences: {
      preload: path.join(preloadPath)
    }
  });

  const authUrl = `${settingsUtil.get('targetServer')}/auth/steam?v2=true`;

  authWindow.loadURL(authUrl);
  authWindow.show();
  authWindow.webContents.on('did-finish-load', () => {
    logger.info('Web contents loaded');
    // authWindow.webContents.openDevTools();
    authWindow.webContents.on('ipc-message', async (_event, channel: string, jwt: string) => {
      logger.info(`IPC Message ${channel}: ${jwt}`);
      if (channel === 'jwtAvailable') {
        authWindow.close();
        onJwt(JSON.parse(jwt));
      }
    });
  });
}

export default function SideNav() {
  const userContext = useContext(UserContext);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showVote, setShowVote] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean>(!!userContext.user);

  let userIcon = <Image src={UserImage} className="user-profile-placeholder" />;
  if (signedIn) {
    userIcon = (
      <Image
        src={userContext.user?.steamAvatarUrl}
        className="user-profile-placeholder"
        roundedCircle
      />
    );
  }

  userIcon = (
    <AccessoryWrapper>
      {userIcon}
      <Image src="https://packs.dbdicontoolbox.com/resources/images/profile_accessory.png" className="profile-avatar-accessory" />
    </AccessoryWrapper>
  );

  const renderTooltip = props => (
    <Tooltip id="writepack-tooltip" {...props}>
      Sign in via Steam for features such as adding packs to your favorites and
      uploading your own!
    </Tooltip>
  );

  const getServerConfig = async () => {
    const config = await api.executor.apis.default.getConfig();
    setShowVote(config.voteActive);
  };

  useEffect(() => {
    getServerConfig();
  }, []);

  return (
    <NavContentWrapper>
      <LogoWrapper>
        <Image src="https://packs.dbdicontoolbox.com/resources/images/toolbox-logo.png" className="sidenav-logo" />
        <LogoLabel>{`Dead By Daylight Icon Toolbox v${(
          electron.app || electron.remote.app
        ).getVersion()}`}</LogoLabel>
        <RefreshWrapper>
          <RefreshIconWrapper
            onClick={() => {
              userContext.checkForUpdates()
            }}
          >
            <i className="fas fa-sync" />
          </RefreshIconWrapper>
          Check For Update
        </RefreshWrapper>
        <Social />
      </LogoWrapper>

      {/* <NavigationLabel>Navigation</NavigationLabel> */}
      <MenuEntry
        text="Featured Packs"
        image={MenuFeatured}
        currentActive={userContext.page}
        to={routes.FEATURED}
        onClick={(target: string) => {
          userContext.setPage(target);
        }}
      />
      <MenuEntry
        text="All Packs"
        image={MenuPerk}
        currentActive={userContext.page}
        to={routes.PERKS}
        onClick={(target: string) => {
          userContext.setPage(target);
        }}
      />
      <MenuEntry
        text="Install Default Icons"
        image={MenuDefaultImage}
        currentActive={userContext.page}
        to={routes.DEFAULT}
        onClick={(target: string) => {
          userContext.setPage(target);
        }}
      />
      {showVote && (
        <MenuEntry
          text="Featured Pack Vote"
          image={MenuVote}
          currentActive={userContext.page}
          to={routes.VOTE}
          onClick={(target: string) => {
            userContext.setPage(target);
          }}
        />
      )}

      {signedIn && (
        <div>
          {userContext.user.abilities.can('create', 'PerkPack') && (
            <MenuEntry
              text="Upload Pack"
              currentActive={userContext.page}
              to={routes.CREATE}
              image={MenuAdd}
              onClick={(target: string) => {
                userContext.setPage(target);
              }}
            />
          )}
          {userContext.user.abilities.can('update', 'PerkPack') && (
            <MenuEntry
              text="My Packs"
              currentActive={userContext.page}
              to={routes.MY_PACKS}
              image={MenuMyPacks}
              onClick={(target: string) => {
                userContext.setPage(target);
              }}
            />
          )}
        </div>
      )}

      {signedIn && userContext.user.abilities.can('manage', 'all') && (
        <MenuEntry
          text="Admin"
          currentActive={userContext.page}
          to={routes.ADMIN}
          image={MenuAdmin}
          onClick={(target: string) => {
            userContext.setPage(target);
          }}
        />
      )}

      {signedIn && userContext.user.abilities.can('update', 'UnmoderatedPacks') && (
        <MenuEntry
          text="Approvals"
          currentActive={userContext.page}
          to={routes.APPROVALS}
          image={MenuAdmin}
          onClick={(target: string) => {
            userContext.setPage(target);
          }}
        />
      )}

      {signedIn && userContext.user.abilities.can('update', 'Users') && (
        <MenuEntry
          text="Users"
          currentActive={userContext.page}
          to={routes.USERS}
          image={MenuAdmin}
          onClick={(target: string) => {
            userContext.setPage(target);
          }}
        />
      )}

      <BottomEntries>
        <MenuEntry
          text="Settings"
          image={MenuSettings}
          currentActive={userContext.page}
          to={routes.SETTINGS}
          onClick={(target: string) => {
            userContext.setPage(target);
          }}
        />
        <MenuEntry
          text="About / Help"
          image={MenuAbout}
          currentActive={userContext.page}
          to={routes.HOME}
          onClick={(target: string) => {
            userContext.setPage(target);
          }}
        />
        {signedIn && (
          <MenuEntry
            text={`Notifications (${userContext.user.numNotifications})`}
            image={MenuNotifications}
            currentActive={userContext.page}
            to={routes.NOTIFICATIONS}
            onClick={(target: string) => {
              userContext.setPage(target);
            }}
          />
        )}
        {signedIn && (
          <MenuEntry
            text={`My Profile`}
            image={MenuProfile}
            currentActive={userContext.page}
            to={routes.MY_PROFILE}
            onClick={(target: string) => {
              userContext.setPage(target);
            }}
          />
        )}
        <SignInWrapper>
          <MenuEntry
            text={signedIn ? 'Sign Out' : 'Sign In'}
            image={signedIn ? MenuSignOut : MenuSignIn}
            currentActive={userContext.page}
            to="/"
            onClick={async (target: string) => {
              if (!signedIn) {
                signIn(async jwt => {
                  if (jwt) {
                    await api.setLoggedIn(jwt);
                    const user = await api.getUser();
                    if (!user) {
                      console.log('Unable to log in');
                      return;
                    }
                    userContext.setUser(user);
                    setSignedIn(true);
                  }
                });
              } else {
                setShowSignOutConfirm(true);
              }
            }}
          />
          {!signedIn && (
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
            >
              <i className="fas fa-question-circle fa-lg ml-2 mr-2"></i>
            </OverlayTrigger>
          )}
        </SignInWrapper>

        <UserProfileWrapper>
          {userIcon}
          {signedIn && <h5>{userContext.user.steamDisplayName}</h5>}
        </UserProfileWrapper>
      </BottomEntries>
      <ConfirmationModal
        show={showSignOutConfirm}
        onHide={() => setShowSignOutConfirm(false)}
        title="Sign Out"
        text="Are you sure you want to Sign Out?"
        onConfirm={async () => {
          await api.setLoggedOut();
          setSignedIn(false);
          userContext.setUser(null);
          setShowSignOutConfirm(false);
        }}
      />
    </NavContentWrapper>
  );
}
