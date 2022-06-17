import React from 'react';
import { Routes as ReactRoutes, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './components/Home';
import PerkPage from './components/Perks';
import SettingsPage from './components/Settings';
import CreatePage from './components/Create';
import DefaultPage from './components/Default';
import MyPacksPage from './components/MyPacks';
import MyProfilePage from './components/MyProfile';
import AdminPage from './components/Admin/Admin';
import ApprovalPage from './components/Admin/Approvals';
import VotePage from './components/Vote/Vote';
import FeaturedPage from './components/Featured';
import UsersPage from './components/Users';
import NotificationsPage from './components/NotificationsPage';

export default function Routes() {
  return (
    <App>
      <ReactRoutes>
        <Route exact path={routes.PERKS} element={<PerkPage/>} />
        <Route exact path={routes.HOME} element={<HomePage/>} />
        <Route exact path={routes.SETTINGS} element={<SettingsPage/>} />
        <Route exact path={routes.CREATE} element={<CreatePage/>} />
        <Route exact path={routes.DEFAULT} element={<DefaultPage/>} />
        <Route exact path={routes.MY_PACKS} element={<MyPacksPage/>}/>
        <Route exact path={routes.MY_PROFILE} element={<MyProfilePage/>}/>
        <Route exact path={routes.ADMIN} element={<AdminPage/>}/>
        <Route exact path={routes.APPROVALS} element={<ApprovalPage/>}/>
        <Route exact path={routes.VOTE} element={<VotePage/>}/>
        <Route exact path={routes.FEATURED} element={<FeaturedPage/>}/>
        <Route exact path={routes.USERS} element={<UsersPage/>}/>
        <Route exact path={routes.NOTIFICATIONS} element={<NotificationsPage/>}/>
      </ReactRoutes>
    </App>
  );
}
