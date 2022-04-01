import React, { Component, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import PlainTextInput from '../Form/PlainTextInput';
import Spinner from 'react-bootstrap/Spinner';
import DatePicker from "react-datepicker";
import api from '../../api/Api';
import { buildPackLabel, ParentSelector } from '../ParentSelector';

type MyProps = {
  show: any;
  onHide: any;
  onConfirm: (packName: string, packAuthor: string, packDesc: string, featured: boolean, packParent?: string, featuredEndDate?: Date) => void;
  packName: string;
  packDescription: string;
  packParent: any;
  packFeatured: boolean;
  operationInProgress: boolean;
  packAuthor: string;
  canEditAuthor: boolean;
  canEditFeatured: boolean;
};

export default function EditPackModal(props: MyProps) {
  const [packName, setPackName] = useState(props.packName);
  const [packDesc, setPackDesc] = useState(props.packDescription);
  const [packAuthor, setPackAuthor] = useState(props.packAuthor);
  const [featured, setFeatured] = useState(props.packFeatured);
  const [packParent, setPackParent] = useState(props.packParent ? buildPackLabel(props.packParent) : undefined);
  const [packs, setPacks] = useState([]);
  const [isPermFeature, setIsPermFeature] = useState(false);
  const [featureEndDate, setFeatureEndDate] = useState(new Date());


  // const loadPacks = async () => {
  //   const packData = await api.getPacks({ light: true, mine: true });
  //   const defaultPack = await api.getPacks({ light: true, defaultOnly: true });
  //   const allPacks = [...packData.data, ...defaultPack.data].map(pack => {
  //     return buildPackLabel(pack);
  //   }).sort((a, b) => {
  //     console.log(a);
  //     console.log(b);
  //     return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
  //   });
  //   setPacks(allPacks);
  // };

  // useEffect(() => {
  //   loadPacks();
  // }, []);

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
        <Modal.Title id="contained-modal-title-vcenter">Edit Pack</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <PlainTextInput
            label="Pack Name"
            value={packName}
            onChange={value => setPackName(value)}
          />
          <PlainTextInput
            label="Pack Description"
            value={packDesc}
            onChange={value => setPackDesc(value)}
          />
          {/* <ParentSelector packs={packs} defaultSelected={packParent} onSetParent={(parent: any) => setPackParent(parent)} /> */}
          {props.canEditAuthor && (<PlainTextInput
            label="Pack Author"
            value={packAuthor}
            onChange={value => setPackAuthor(value)}
          />)}
          {props.canEditFeatured && (<Form.Check
            type="checkbox"
            label="Pack Featured"
            checked={featured}
            onChange={e => {
              setFeatured(e.target.checked);
            }}
          />)}
          {props.canEditFeatured && (<Form.Check
            type="checkbox"
            label="Permanent Feature"
            checked={isPermFeature}
            onChange={e => {
              setIsPermFeature(e.target.checked);
            }}
          />)}
          {props.canEditFeatured && (<DatePicker showTimeSelect selected={featureEndDate} onChange={(date: Date) => setFeatureEndDate(date)} />)}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="info"
          onClick={() => {
            props.onConfirm(packName, packAuthor, packDesc, featured, isPermFeature ? undefined : featureEndDate);
          }}
        >
          {' '}
          {props.operationInProgress && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              className="mr-2"
              role="status"
              aria-hidden="true"
            />
          )}
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
