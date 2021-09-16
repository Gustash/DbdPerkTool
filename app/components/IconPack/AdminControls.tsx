import React, { useState, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import UserContext from '../../context/UserContext';
import Spinner from 'react-bootstrap/Spinner';
import ErrorModal from '../ErrorModal';
import SuccessModal from '../SuccessModal';
import api from '../../api/Api';
import EditPackModal from './EditPackModal';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';

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

export default function AdminControls(props: MyProps) {
  const userContext = useContext(UserContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [showEditPack, setShowEditPack] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [showError, setShowError] = useState(false);
  const [editInProgress, setEditInProgress] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successText, setSuccessText] = useState('');

  const showAuthor: boolean = userContext?.user?.abilities?.can('manage', 'all');

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

  return (
    <AdminControlsWrapper>
      <Button
        className="w-100 mr-1 ml-1"
        variant="info"
        onClick={() => {
          setShowEditPack(true);
        }}
      >
        Edit
      </Button>
      <Link to={{
        pathname: routes.CREATE,
        state: { id: props.id }
      }} className="w-100 mr-1">
        <Button
          className="w-100"
          variant="info"
          onClick={() => userContext.setPage(routes.CREATE)}
        >
          Update
        </Button>
      </Link>

      <Button
        className="w-100 mr-1"
        variant="info"
        onClick={async () => {
          setShowConfirm(true);
        }}
      >
        Delete
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
      <EditPackModal
        operationInProgress={editInProgress}
        show={showEditPack}
        onHide={() => {
          setShowEditPack(false);
        }}
        onConfirm={async (name: string, author: string, desc: string) => {
          if (name !== props.meta.name || desc !== props.meta.description || author !== props.meta.author) {
            setEditInProgress(true);
            try {
              await api.executor.apis.default.editPack(
                { id: props.id },
                { requestBody: { name, description: desc, author } }
              );
              props.onModifyComplete();
            } catch (e) {
              setErrorText(e.message);
              setShowError(true);
              // Show error
            } finally {
              setEditInProgress(false);
              setShowEditPack(false);
            }
          } else {
            setShowEditPack(false);
          }
        }}
        packName={props.meta.name}
        canEditAuthor={showAuthor}
        packAuthor={props.meta.author}
        packDescription={props.meta.description}
      ></EditPackModal>
    </AdminControlsWrapper>
  );
}
