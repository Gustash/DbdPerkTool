import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

type MyProps = { show: any, onAgree: any, onHide: any };

export default function UploadAgreement(props: MyProps) {
    return (
        <Modal
            show={props.show}
            size="lg"
            onHide={props.onHide}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    User Upload Agreement
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h4>By clicking "Agree", you accept the following conditions:</h4>
                <ul>
                    <li>No NSFW content. If you upload NSFW content, you will be immediately banned</li>
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onAgree}>Agree</Button>
                <Button variant="secondary" onClick={props.onHide}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
}