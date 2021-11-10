import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
// @ts-ignore
import uuid from 'react-uuid';
import styled from 'styled-components';
import Badge from '../Badge';

type MyProps = {
  images?: Array<string>;
  urls?: Array<string>;
  id?: string;
  baseUrl?: string;
  onPickImage?: any;
};

const ImageContainer = styled.div`
  display: flex;
  position: relative;
  text-align: center;
`;

function buildNormalPreview(props: MyProps, additionalImgClasses: string) {
  const imageClass = `perk-preview-img${additionalImgClasses}`;
  const images = props.urls?.map<React.ReactNode>((url) => {
    return (
      <Col key={uuid()}>
        <Image key={Date.now()} className={imageClass} src={`${props.baseUrl}${url}`} fluid />
      </Col>
    );
  });
  return (
    <Row className="flex-nowrap">
      <ImageContainer>
        {images}{' '}
      </ImageContainer>
    </Row>
  );
}

function buildStaticPreview(props: MyProps, additionalImgClasses: string) {
  const imageClass = `perk-preview-img${additionalImgClasses}`;
  const images = props.images?.map<React.ReactNode>((image, index) => {
    return (
      <Badge>
      <Col key={uuid()} onClick={() => { props.onPickImage(index) }}>
        <Image key={Date.now()} className={imageClass} src={image} fluid />
        <i className="fas fa-upload" ></i>
      </Col>
      </Badge>
    );
  });
  return (
    <Row className="flex-nowrap">
      <ImageContainer>
        {images}{' '}
      </ImageContainer>
    </Row>
  );
}

export default function MainPreview(props: MyProps) {
  let content;
  const additionalImgClasses = '';
  content = props.urls ? buildNormalPreview(props, additionalImgClasses) : buildStaticPreview(props, additionalImgClasses);
  return content;
}
