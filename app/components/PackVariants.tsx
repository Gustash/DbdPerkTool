import React, { useState, useContext } from 'react';
import { Button, Row } from 'react-bootstrap';
import MainPreview from './IconPack/MainPreview';
import styled from 'styled-components';

const PackVariantWrapper = styled.div`
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.5);
    padding:10px;
    margin-bottom: 5px;
`
const PackVariantButtons = styled.div`
display: flex;
flex-direction: row;
`

function PackVariant(props: { pack: any, onDetails: (id: string) => void, onInstall: (id: string) => void }) {
  const urls = [...Array(4).keys()].map(index => {
    return `preview_${index}.png`;
  });
  return <PackVariantWrapper>
    <b>{props.pack.author} - {props.pack.name}</b>
    <MainPreview baseUrl={props.pack.previewDir} urls={urls} />
    <PackVariantButtons>
      <Button variant="secondary w-100 mr-1" onClick={() => props.onInstall(props.pack.id)}>Install</Button>
      <Button variant="secondary w-100" onClick={() => props.onDetails(props.pack.id)}>Details</Button>
    </PackVariantButtons>
  </PackVariantWrapper>
}

export function PackVariants(props: { variants?: Array<any>, onVariantDetails?: (id: string) => void, onVariantInstall?: (id: string) => void }) {
  if (!Array.isArray(props.variants)) {
    return null;
  }


  return <div>{props.variants.map(variant => <PackVariant pack={variant} onDetails={id => props.onVariantDetails?.(id)} onInstall={id => props.onVariantInstall?.(id)} />)}</div>
}