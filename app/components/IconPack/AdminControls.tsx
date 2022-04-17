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
import { Link, useNavigate } from 'react-router-dom';
import routes from '../../constants/routes.json';
import PurchaseFeatureModal from './PurchaseFeatureModal';

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
  const [showFeature, setShowFeature] = useState(false);
  const navigate = useNavigate();

  const isAdmin: boolean = !!userContext?.user?.abilities?.can('manage', 'all');
  const showAuthor: boolean = isAdmin;
  const showFeatureEdit: boolean = isAdmin;

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
      <Button
        className="w-100 mr-1"
        variant="info"
        onClick={() => {
          navigate(routes.CREATE, { state: { id: props.id } });
          userContext.setPage(routes.CREATE);
        }}
      >
        Update
      </Button>

      <Button
        className="w-100 mr-1"
        variant="info"
        onClick={async () => {
          setShowConfirm(true);
        }}
      >
        Delete
      </Button>
      <Button
        className="w-100 mr-1"
        variant="warning"
        onClick={async () => {
          setShowFeature(true);
        }}
      >
        Feature
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
      <PurchaseFeatureModal show={showFeature} onHide={() => { setShowFeature(false) }} pack={props.meta} />
      <EditPackModal
        operationInProgress={editInProgress}
        show={showEditPack}
        onHide={() => {
          setShowEditPack(false);
        }}
        onConfirm={async (name: string, author: string, desc: string, featured: boolean, parent: any, featuredEndDate?: Date) => {
          if (name !== props.meta.name || desc !== props.meta.description || author !== props.meta.author || featured != props.meta.featured || parent !== props.meta.parent?.id) {
            setEditInProgress(true);
            const reqBody: any = { name, description: desc, author, featured: featured };

            if (featured) {
              reqBody.featuredEnd = featuredEndDate?.toISOString();
            }

            if(parent) {
              reqBody.parent = parent;
            }

            try {
              await api.executor.apis.default.editPack(
                { id: props.id },
                { requestBody: reqBody }
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
        packFeatured={!!props.meta.featured}
        packParent={props.meta.parent}
        canEditAuthor={showAuthor}
        canEditFeatured={showFeatureEdit}
        packAuthor={props.meta.author}
        packDescription={props.meta.description}
      ></EditPackModal>
    </AdminControlsWrapper>
  );
}
