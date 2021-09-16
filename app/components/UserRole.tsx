import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { Dropdown } from 'react-bootstrap';
import UserContext from "../context/UserContext";
import api from '../api/Api';
import ErrorModal from "./ErrorModal";

const roles = [
    {
        type: 'RestrictedUser',
        label: 'Banned User'
    },
    {
        type: 'BasicUser',
        label: 'Basic User',
    },
    {
        type: 'Moderator',
        label: 'Moderator'
    },
    {
        type: 'Administrator',
        label: 'Administrator',
    },
    {
        type: 'TrustedCreator',
        label: 'Trusted Creator'
    }
];

export default function UserRole(props: { username: string, initialRole: string, onRoleChanged: (newRole: string) => void }) {
    const [role, setRole] = useState(props.initialRole);
    const [errorText, setErrorText] = useState('Unknown error setting user role');
    const [showError, setShowError] = useState(false);
    const userContext = useContext(UserContext);

    useEffect(() => { setRole(props.initialRole) }, [props.initialRole])

    const getRoleLabelFromType = (type: string) => {
        return roles.find(role => role.type === type)?.label ?? type;
    };

    const doSetRole = async (newRole: string) => {
        try {
            await api.setUserRole(props.username, newRole);
        } catch(e) {
            if(e?.statusCode === 403 || e?.status === 403) {
                setErrorText('You are forbidden from applying this role to the user.');
            } else {
                setErrorText(`Error applying role to user: ${e.message}`);
            }
            setShowError(true);
            return;
        }

        setRole(newRole);
        props.onRoleChanged(newRole);
    };

    return (
        <div>
            <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {getRoleLabelFromType(role)}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => doSetRole('RestrictedUser')}>{getRoleLabelFromType('RestrictedUser')}</Dropdown.Item>
                    <Dropdown.Item onClick={() => doSetRole('BasicUser')}>{getRoleLabelFromType('BasicUser')}</Dropdown.Item>
                    <Dropdown.Item onClick={() => doSetRole('TrustedCreator')}>{getRoleLabelFromType('TrustedCreator')}</Dropdown.Item>
                    <Dropdown.Item onClick={() => doSetRole('Moderator')}>{getRoleLabelFromType('Moderator')}</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <ErrorModal text={errorText} show={showError} onHide={() => setShowError(false)}></ErrorModal>
        </div>);
}