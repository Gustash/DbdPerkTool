import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './components/Home';
import PerkPage from './components/Perks';
import SettingsPage from './components/Settings';
import CreatePage from './components/Create';
import PortraitPage from './components/Portraits';
import DefaultPage from './components/Default';
import MyPacksPage from './components/MyPacks';
import MyProfilePage from './components/MyProfile';
import AdminPage from './components/Admin/Admin';
import ApprovalPage from './components/Admin/Approvals';
import VotePage from './components/Vote/Vote';
import FeaturedPage from './components/Featured';
import UsersPage from './components/Users';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route exact path={routes.PERKS} component={PerkPage} />
        <Route exact path={routes.HOME} component={HomePage} />
        <Route exact path={routes.SETTINGS} component={SettingsPage} />
        <Route exact path={routes.CREATE} component={CreatePage} />
        <Route exact path={routes.DEFAULT} component={DefaultPage} />
        <Route exact path={routes.MY_PACKS} component={MyPacksPage}/>
        <Route exact path={routes.MY_PROFILE} component={MyProfilePage}/>
        <Route exact path={routes.ADMIN} component={AdminPage}/>
        <Route exact path={routes.APPROVALS} component={ApprovalPage}/>
        <Route exact path={routes.VOTE} component={VotePage}/>
        <Route exact path={routes.FEATURED} component={FeaturedPage}/>
        <Route exact path={routes.USERS} component={UsersPage}/>
      </Switch>
    </App>
  );
}
