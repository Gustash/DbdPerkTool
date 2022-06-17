import React, { useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import routes from '../constants/routes.json';
import styled from 'styled-components';
import UserContext from '../context/UserContext';
import api from '../api/Api';
import Notifications from './Notifications';

type MyProps = {};


const NotificationContainer = styled.div`
    display: flex;
    background: rgba(0, 0, 0, .5);
    flex-direction: column;
    min-width: 800px;
    height: 100%;
    overflow-y: scroll;
    padding: 10px;
`

const ProfileContainer = styled.div`
    display: flex;
    background: rgba(0, 0, 0, .5);
    flex-direction: column;
    min-width: 800px;
    height: 100%;
    overflow-y: none;
    padding: 10px;
`

export default function NotificationsPage(props: MyProps) {
  const userContext = useContext(UserContext);

  const refreshUser = async () => {
    userContext.setUser(await api.getUser());
    await userContext.user?.getNotifications();
  };

  useEffect(() => {
    refreshUser();
  }, []);

  if (!userContext.user) {
    return <Redirect to={routes.PERKS} />;
  }

  return (
    <ProfileContainer>
      <NotificationContainer>
        <Notifications></Notifications>
      </NotificationContainer>
    </ProfileContainer>
  );
}
