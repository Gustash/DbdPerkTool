import React, { Component, useState, useContext } from 'react';
import fs from 'fs-extra';
import log from 'electron-log';
import path from 'path';
import { app, remote, shell } from 'electron';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import UserContext from '../../context/UserContext';
import Spinner from 'react-bootstrap/Spinner';
import ErrorModal from '../ErrorModal';
import SuccessModal from '../SuccessModal';
import api from '../../api/Api';
import EditPackModal from './EditPackModal';
import UpdatePackModal from './UpdatePackModal';
import PackDir from '../../packdir/PackDir';
import PackGenerator from '../../packgenerator/PackGenerator';
import settingsUtil from '../../settings/Settings';
import { promisify } from 'util';
import rimraf from 'rimraf';
import Api from '../../api/Api';

type MyProps = {
  id: string;
  meta: any;
  onModifyComplete: any;
};

const AdminControlsWrapper = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 4px;
  margin-top: 4px;
`;

export default function ApprovalControls(props: MyProps) {
  const userContext = useContext(UserContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successText, setSuccessText] = useState('');

  const handleDeleteClose = async (doDelete = false) => {
    setDeleteInProgress(true);
    try {
      if (doDelete) {
        await api.executor.apis.default.deletePack({ id: props.id });
        props.onModifyComplete();
      }
    } catch (e) {
      setErrorText(e.message);
      setShowError(true);
      // Show error
    } finally {
      setDeleteInProgress(false);
      setShowConfirm(false);
    }
  };

  const handleApprovePack = async () => {
    try {
        await Api.approvePack(props.id);
        props.onModifyComplete();

    } catch (e) {
      setErrorText(e.message);
      setShowError(true);
    }
  };

  return (
    <AdminControlsWrapper>
      <Button
        className="w-100 mr-1 ml-1 approve-button"
        variant="info"
        onClick={() => {
            handleApprovePack();
        }}
      >
        Approve
      </Button>
      <Button
        className="w-100 mr-1 reject-button"
        variant="info"
        onClick={async () => {
          setShowConfirm(true);
        }}
      >
        Reject
      </Button>
      <Modal
        show={showConfirm}
        onHide={() => {
          handleDeleteClose(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will delete pack {props.meta.name}. Are you sure about that?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="info"
            onClick={() => {
              handleDeleteClose(true);
            }}
          >
            {deleteInProgress && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            )}
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      <ErrorModal
        title="Error Modifying Pack"
        onHide={() => setShowError(false)}
        show={showError}
        text={errorText}
      ></ErrorModal>
      <SuccessModal
        title={`${props.meta.name} Updated`}
        show={showSuccess}
        onHide={() => setShowSuccess(false)}
        text={successText}
      ></SuccessModal>
    </AdminControlsWrapper>
  );
}
