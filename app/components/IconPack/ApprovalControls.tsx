import React, { useState, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import UserContext from '../../context/UserContext';
import Spinner from 'react-bootstrap/Spinner';
import ErrorModal from '../ErrorModal';
import SuccessModal from '../SuccessModal';
import api from '../../api/Api';
import Api from '../../api/Api';
import { Form } from 'react-bootstrap';

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
  const [rejectReason, setRejectReason] = useState('');

  const handleDeleteClose = async (doDelete = false) => {
    setDeleteInProgress(true);
    try {
      if (doDelete) {
        await api.executor.apis.default.rejectPack({ id: props.id }, { requestBody: { reason: rejectReason } });
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
          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>Please enter a reason for your rejection [REQUIRED]</Form.Label>
            <Form.Control as="textarea" rows={3} onChange={e => setRejectReason(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="info"
            onClick={() => {
              if (rejectReason && rejectReason.length > 0) {
                handleDeleteClose(true);
              }
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
