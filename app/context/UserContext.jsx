import React from 'react';

const UserContext = React.createContext({
  user: null,
  page: '',
  setUser: user => {},
  setPage: page => {},
});

export default UserContext;
