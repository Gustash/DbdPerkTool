import React, { Component, useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import routes from '../constants/routes.json';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import PlainTextInput from './Form/PlainTextInput';
import UserContext from '../context/UserContext';
import AuthorLink from './MyProfile/AuthorLink';
import uuid from 'react-uuid';
import SuccessModal from './SuccessModal';
import api from '../api/Api';
import NoAuthorProfile from './NoAuthorProfile';
import { DefaultContainer } from './DefaultContainer';
import { ApiNotifications } from '../api/ApiTypes';
import Notifications from './Notifications';

type MyProps = {};

const DescriptionHeader = styled.h4``;

const UserInfoHeader = styled.h6``;

const AddLinkWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-right: 10px;
  align-items: center;
`;

const UserImageWrapper = styled.div`
display: flex;
justify-content: center;
`;

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

export default function MyProfile(props: MyProps) {
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

  const [blurb, setBlurb] = useState(userContext.user.author?.blurb);
  const [links, setLinks] = useState(userContext.user.author?.links);
  const [showSuccess, setShowSuccess] = useState(false);
  const [donateLink, setDonateLink] = useState(
    userContext.user.author?.donateLink
  );

  const addLink = () => {
    setLinks([...links, { label: '', link: '' }]);
  };

  const authorLinks = links.map((link, index) => {
    return (
      <AuthorLink
        key={uuid()}
        label={link.label}
        link={link.link}
        onChange={(label: string, linkText: string) => {
          link.label = label;
          link.link = linkText;
        }}
        onRemove={() => {
          const newLinks = [...links];
          newLinks.splice(index, 1);
          setLinks(newLinks);
        }}
      ></AuthorLink>
    );
  });

  return (
    <ProfileContainer>
      <DefaultContainer>
        <UserImageWrapper>
          <Image
            src={userContext.user.steamAvatarUrl}
            className="my-profile-avatar"
            roundedCircle
          />
        </UserImageWrapper>
        <UserInfoHeader><b>Author Name:</b> {userContext.user.author.name}</UserInfoHeader>
        <UserInfoHeader><b>Role:</b> {userContext.user.role}</UserInfoHeader>
        <UserInfoHeader><b>Total pack downloads:</b> {userContext.user.author.totalDownloads ?? 'Unknown'}</UserInfoHeader>
        <Form
          onSubmit={async e => {
            e.preventDefault();
            await api?.updateAuthorProfile({
              blurb,
              donateLink,
              links
            });
            await userContext.setUser(await api.getUser());
            setShowSuccess(true);
          }}
        >
          <DescriptionHeader>General</DescriptionHeader>
          <PlainTextInput
            label="About Me"
            value={blurb}
            onChange={value => setBlurb(value)}
          />
          <PlainTextInput
            label="Donation Link"
            value={donateLink}
            onChange={value => setDonateLink(value)}
          />
          <DescriptionHeader>
            Other Links (Discord, Twitter, etc..)
          </DescriptionHeader>
          {authorLinks}
          <AddLinkWrapper>
            <i
              onClick={() => {
                addLink();
              }}
              className="fas fa-plus-circle fa-2x author-link-add"
            ></i>
          </AddLinkWrapper>
          <Button variant="secondary" type="submit">
            Save
          </Button>
        </Form>
      </DefaultContainer>
      <SuccessModal
        onHide={() => setShowSuccess(false)}
        title="Success"
        text="Author profile updated successfully!"
        show={showSuccess}
      ></SuccessModal>
      <br/>
      <NotificationContainer>
        <Notifications></Notifications>
      </NotificationContainer>
    </ProfileContainer>
  );
}
