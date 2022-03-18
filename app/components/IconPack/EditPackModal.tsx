import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import PlainTextInput from '../Form/PlainTextInput';
import Spinner from 'react-bootstrap/Spinner';
import DatePicker from "react-datepicker";

type MyProps = {
  show: any;
  onHide: any;
  onConfirm: (packName: string, packAuthor: string, packDesc: string, featured: boolean, featuredEndDate?: Date) => void;
  packName: string;
  packDescription: string;
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
  const [isPermFeature, setIsPermFeature] = useState(false);
  const [featureEndDate, setFeatureEndDate] = useState(new Date());
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
            onChange={e => setPackName(e.target.value)}
          />
          <PlainTextInput
            label="Pack Description"
            value={packDesc}
            onChange={e => setPackDesc(e.target.value)}
          />
          {props.canEditAuthor && (<PlainTextInput
            label="Pack Author"
            value={packAuthor}
            onChange={e => setPackAuthor(e.target.value)}
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
