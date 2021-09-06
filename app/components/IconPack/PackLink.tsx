import React, { useState, useContext } from 'react';
import Card from 'react-bootstrap/Card';
import styled from 'styled-components';
import api from '../../api/Api';
import UserContext from '../../context/UserContext';
import { clipboard } from 'electron';
import log from 'electron-log';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

const PackLinkWrapper = styled.span`
  margin-left: 4px;
  color: white;

  &:hover {
    color: var(--main-color);
    cursor: pointer;
  }

  &:active {
    color: var(--secondary-color);
    cursor: pointer;
  }
`;


const renderTooltip = props => (
    <Tooltip id={`copyid-${props.id}-tooltip`} {...props}>
        Copy a direct link to this pack to send to friends! If clicked, the toolbox will open and the linked pack will be shown. It can also be pasted directly into the search bar.
    </Tooltip>
);


export default function PackLink(props: { id: string }) {
    const buildPackAppLink = () => {
        return `dbdicontoolbox://${props.id}`;
    };

    const copyAppLink = () => {
        const appLink = buildPackAppLink();
        log.info(`Copying ${appLink} to clipboard`);
        clipboard.writeText(appLink);
    }

    return (<OverlayTrigger
        placement="right"
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip}
        trigger={['hover']}
    >
        <PackLinkWrapper><i className="fas fa-link" onClick={copyAppLink}></i></PackLinkWrapper>
    </OverlayTrigger>)

}