import React, { Component, useState, useContext } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Author from './IconPack/Author';
import LatestChapter from './IconPack/LatestChapter';
import Title from './IconPack/Title';
import UserContext from '../context/UserContext';
import MainPreview from './IconPack/MainPreview';


type MyProps = {
    author: string;
    name: string;
    images: string[];
    handlePickImage: any;
};


export default function PreviewSelector(props: MyProps) {
    let cardBody = (
        <Card.Body className="mb-0">
            <Row className="mb-2">
                <Col>
                    <b>Author:</b>{' '}
                    <Author
                        onClick={(_name: string) => {

                        }}
                        name={props.author}
                    />
                </Col>
                <Col>
                    <b>Downloads:</b> 0
                </Col>
            </Row>
            <Row className="mb-2">
                <Col>
                    <b>Latest Chapter:</b>{' '}
                    <LatestChapter
                        name='Preview Chapter'
                        onClick={() => { }}
                    />
                </Col>
            </Row>
        </Card.Body>
    );

    return (
        <div>
            <Card className={`ml-0 mr-0 text-center perk-card pack-featured`}>
                <Card.Body>
                    <MainPreview
                        images={props.images}
                        viewMode={'Normal'}
                        onPickImage={props.handlePickImage}
                    />
                </Card.Body>
                <Title
                    name={props.name}
                    preview={true}
                />
                {cardBody}
            </Card>
        </div>
    );
}
