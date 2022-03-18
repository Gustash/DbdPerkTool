import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import PlainTextInput from '../Form/PlainTextInput';
import Spinner from 'react-bootstrap/Spinner';
import DatePicker from "react-datepicker";
import { PackMeta } from '../../api/ApiTypes';
import path from 'path';
import logger from 'electron-log';
import settingsUtil from '../../settings/Settings';
import electron from 'electron';
import { Dropdown } from 'react-bootstrap';
import uuid from 'react-uuid';

const { BrowserWindow, app, shell } = electron.remote;

type MyProps = {
    show: any;
    onHide: any;
    pack: PackMeta;
};

const prices = [
    {
        type: '1',
        label: '1 Month - $3USD'
    },
    {
        type: '2',
        label: '2 Months - $5USD',
    },
    {
        type: '6',
        label: '6 Months - $12USD'
    },
    {
        type: '12',
        label: '12 Months - $24USD',
    },
];

async function doCheckout(packId: string, months: string) {
    shell.openExternal(`${settingsUtil.get('targetServer')}/featured-pack-checkout?packId=${encodeURIComponent(packId)}&months=${months}`);
}

export default function PurchaseFeatureModal(props: MyProps) {
    const [price, setPrice] = useState(prices[0].type);

    const priceMenuOpts = prices.map(p => {
        if(p.type === price) {
            return (<Form.Check checked key={uuid()} onClick={() => setPrice(p.type)} type='radio' label={p.label}/>)
        } else {
            return (<Form.Check key={uuid()} onClick={() => setPrice(p.type)} type='radio' label={p.label}/>)
        } 
    });

    return (
        <Modal
            show={props.show}
            size="xl"
            onHide={() => {
                props.onHide();
            }}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Purchase Feature for {props.pack.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form>
                {priceMenuOpts}
            </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="info"
                    onClick={() => {
                        doCheckout(props.pack.id, price);
                        setTimeout(() => props.onHide(), 2000);
                    }}
                >
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
