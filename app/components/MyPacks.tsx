import React, { Component, useContext } from 'react';
import PackDisplay from './PackDisplay';
import UserContext from '../context/UserContext';
import NoAuthorProfile from './NoAuthorProfile';

export default function MyPacks() {
  const userContext = useContext(UserContext);

  const userAuthorProfile = userContext.user.author;

  if (!userAuthorProfile) {
    return <NoAuthorProfile/>
  } else {
    return (
      <PackDisplay mine={true} />
    );
  }
}
