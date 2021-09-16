import React, { useState, useEffect, useContext } from 'react';
import Form from 'react-bootstrap/Form';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Toast from 'react-bootstrap/Toast';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useDebouncedCallback } from 'use-debounce';
import log from 'electron-log';
import styled from 'styled-components';
import { show } from '../app.bootstrap.min.css';
import UserContext from '../context/UserContext';

type MyProps = {
  onSearchFilter: Function;
  initialFilterText: string;
};

const Container = styled.div`
  display: flex;
  margin-bottom: 6px;
  flex-wrap: nowrap;
  justify-content: center;
`;

export default function PackDisplayHeader(props: MyProps) {
  const userContext = useContext(UserContext);
  const [searchText, setSearchText] = useState(props.initialFilterText);

  // The idea here is to only actually run the search after the user is finished typing
  const [debounceSearchCallback] = useDebouncedCallback(text => {
    log.info(`Running search: ${text}`);
    props.onSearchFilter(text);
  }, 500);


  const setSearchFilter = (text: string) => {
    if(text.startsWith('dbdicontoolbox://')) {
      text = text.split('dbdicontoolbox://')[1];
    }
    setSearchText(text);
    debounceSearchCallback(text);
  };

  useEffect(() => setSearchText(props.initialFilterText), [
    props.initialFilterText
  ]);

  return (
    <Container>
      <Form.Control
        style={{
          maxWidth: '400px',
          minWidth: '100px',
        }}
        type="text"
        placeholder="Search"
        className="mr-sm-2 dbd-input-field"
        onChange={e => {
          setSearchFilter(e.target.value);
        }}
        value={searchText}
      />
    </Container>
  );
}
