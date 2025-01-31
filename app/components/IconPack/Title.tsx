import React, { useState, useContext } from 'react';
import Card from 'react-bootstrap/Card';
import styled from 'styled-components';
import api from '../../api/Api';
import UserContext from '../../context/UserContext';
import PackLink from './PackLink';

const FavoriteWrapper = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  color: #d4af37;

  &:hover {
    color: yellow;
    cursor: pointer;
  }
`;

type MyProps = {
  name: string;
  id?: string;
  isApproved?: boolean;
  isFeatured?: boolean;
  preview?: boolean;
  variantOf?: string;
};

export default function Title(props: MyProps) {
  const userContext = useContext(UserContext);
  const isFavorite =
    userContext.user &&
    userContext.user.favorites.find(pack => pack.id === props.id);

  const ribbonClass = !props.isApproved ? 'ribbon-unapproved' : 'ribbon';
  const ribbonText = !props.isApproved ? 'UNAPPROVED' : 'Featured';
  const hasRibbon = !props.preview && (props.isFeatured || !props.isApproved);

  const favoriteStarClass = isFavorite
    ? 'fas fa-star fa-lg'
    : 'far fa-star fa-lg';
  const favoriteStar =
    (!props.preview && userContext.user != null) ? (
      <FavoriteWrapper
        onClick={async () => {
          await api.updateFavorite(props.id, !isFavorite);
          await api.getUser();
          userContext.setUser(api.currentUser);
        }}
      >
        <i className={favoriteStarClass}></i>
      </FavoriteWrapper>
    ) : null;
  if (hasRibbon) {
    return (
      <Card.Title>
        {favoriteStar}
        <div className="ribbon-wrapper">
          <div className={ribbonClass}>{ribbonText}</div>
        </div>
        {props.name}             
        <PackLink id={props.id}></PackLink>
      </Card.Title>
    );
  } else {
    return (
      <Card.Title>
        {favoriteStar}
        {props.name}
        {!props.preview && <PackLink id={props.id}></PackLink>}
      </Card.Title>
    );
  }
}
