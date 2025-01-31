import React from 'react';
import { User } from '../api/ApiTypes';

export type UserContextType = {
  user: User | null;
  page: string;
  setUser: (user: User) => void;
  setPage: (page: string) => void;
  checkForUpdates: () => void;
}

const UserContext = React.createContext<UserContextType>({
  user: null,
  page: '',
  setUser: () => { },
  setPage: () => { },
  checkForUpdates: () => { }
});

export default UserContext;
