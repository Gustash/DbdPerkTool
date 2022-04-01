import React, { useState, useEffect, useContext } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { createMemoryHistory, History } from 'history';
import { Store } from '../reducers/types';
import Routes from '../Routes';
import SideNav from '../components/SideNav';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import UpdateYesNoDialog from '../components/update/UpdateYesNoDialog';
import UpdateProgress from '../components/update/UpdateProgress';
import settingsUtil from '../settings/Settings';
import DeadByDaylight from '../steam/DeadByDaylight';
import UserContext from '../context/UserContext';
import Notification, { NotificationType } from '../components/Notification';
import electron from 'electron';
import api from '../api/Api';
import routes from '../constants/routes.json';
import { ApiNotification } from '../api/ApiTypes';
import Api from '../api/Api';
import { Router } from 'react-router-dom';

type Props = {
  store: Store;
  history: History;
};

const Content = styled.div`
  flex: 1;
  overflow: hidden;
  padding-bottom: 6px;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
`;

type NotificationState = { show: boolean } & Pick<ApiNotification, 'name' | 'text' | '_id'>;

const history = createMemoryHistory();

const Root = ({ store }: Props) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showUpdateDbdPath, setShowUpdateDbdPath] = useState(false);
  const [detectedDbdPath, setDetectedDbdPath] = useState('');
  const [userNotificationPopupDismissed, setUserNotificationPopupDismissed] = useState(false);
  const [page, setCurrentPage] = useState(routes.PERKS);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [currentUser, setCurrentUser] = useState(api.currentUser);
  const [labeledPacks, setLabeledPacks] = useState([]);

  const onUpdateModalClose = (doUpdate: boolean) => {
    log.info('Do Update: ', doUpdate);
    setShowUpdateModal(false);
    setShowProgressModal(doUpdate);
    ipcRenderer.send('update-available-resp', doUpdate);
  };

  const popNotification = async () => {
    const notification = await api.popNotification();

    if (notification) {
      setNotification({
        show: true,
        _id: notification._id,
        text: notification.text,
        name: notification.name
      });
    } else if (currentUser && !userNotificationPopupDismissed) {
      const hasNotifications = await currentUser.getNumNotifications();

      if (hasNotifications) {
        setUserNotificationPopupDismissed(true);
        setNotification({
          show: true,
          _id: '',
          text: 'Go to your profile to see your unread notifications!',
          name: 'You have new account notifications'
        });
      }
    }
  };

  const checkDbdPath = async () => {

    try {
      const dbd = new DeadByDaylight();
      const dbdPath = await dbd.getInstallPath();
      log.info(`Detected DBD Path: ${dbdPath}`);
      if (!settingsUtil.settings.overrideInstallPath && dbdPath && dbdPath.length > 0 && dbdPath.toLowerCase() !== settingsUtil.settings.dbdInstallPath.toLowerCase()) {
        log.info(`Setting DBD install path to ${dbdPath}`);
        settingsUtil.settings.dbdInstallPath = dbdPath;
        await settingsUtil.save();
        log.info('Saved dbd path');
      } else {
        log.info('Not saving DBD path');
      }
    } catch (err) {
      log.error('Error saving DBD Path: ', err);
    }
  };

  useEffect(() => {
    log.info(`Starting Toolbox v${(
      electron.app || electron.remote.app
    ).getVersion()}`);

    ipcRenderer.on('update-available', (event, arg) => {
      log.info(`Update available: ${JSON.stringify(arg)}`);
      setShowUpdateModal(true);
      log.info(`Release notes: ${arg.releaseNotes}`);
      setReleaseNotes(arg.releaseNotes);
      setLatestVersion(arg.version);
    });

    ipcRenderer.on('update-progress', (event, arg) => {
      log.info('Update: ', arg);
      setShowProgressModal(true);
      setUpdateProgress(parseInt(arg.percent));
    });
    checkDbdPath();
    popNotification();

    const interval = setInterval(async () => {
      if(currentUser) {
        setCurrentUser(await Api.getUser());
      }
    }, 30000);

    return () => {
      ipcRenderer.removeAllListeners('update-available');
      ipcRenderer.removeAllListeners('update-progress');
      clearInterval(interval);
    };
  }, []);


  return (
    <Provider store={store}>
      <Router location={history.location} navigator={history}>
        <UserContext.Provider
          value={{
            user: currentUser,
            setUser: user => {
              setCurrentUser(user);
            },
            page,
            setPage: newPage => setCurrentPage(newPage)
          }}
        >
          <MainContainer>
            <SideNav />
            <Content>
              <Row className="main-content shadow m-2 justify-content-center">
                <Routes />
              </Row>
            </Content>
            <UpdateYesNoDialog
              version={latestVersion}
              releaseNotes={releaseNotes}
              show={showUpdateModal}
              onClose={onUpdateModalClose}
            />
            <UpdateProgress
              progress={updateProgress}
              show={showProgressModal}
            />
            {notification && (<Notification
              show={notification.show}
              id={notification._id}
              title={notification.name}
              text={notification.text}
              onHide={async () => {
                setNotification(null);
                try {
                  await popNotification();
                } catch (err) {
                  logger.error(err);
                }
              }}
            />)}
          </MainContainer>
        </UserContext.Provider>
      </Router>
    </Provider>
  );
};

export default hot(Root);
