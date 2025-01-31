import React, { ChangeEvent } from 'react';
import Form from 'react-bootstrap/Form';
import { Typeahead } from 'react-bootstrap-typeahead';
import styled from 'styled-components';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Badge from '../Badge';
import { Button, FormControlProps } from 'react-bootstrap';

const { dialog } = require('electron').remote;

type MyProps = {
  onChange?: (value: string) => void;
  onSelect?: (value: any) => void;
  disabled?: boolean;
  options?: any;
  value?: string;
  label: string;
  help?: any;
  defaultSelected?: any;
  pathPicker?: boolean;
  allowNew?: boolean;
};

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const InputValueWrapper = styled.div`
  flex: 1;
  margin-left: 10px;
`;

export default function PlainTextInput(props: MyProps) {
  let input;
  let tooltip = undefined;

  const helpTxt = props.help;

  if (props.help) {
    const renderTooltip = props => (
      <Tooltip id="pti-tooltip" {...props}>
        {helpTxt}
      </Tooltip>
    );
    tooltip = (
      <OverlayTrigger
        placement="right"
        delay={{ show: 250, hide: 1000 }}
        overlay={renderTooltip}
        trigger={['click']}
      >
        <Badge className="fas fa-question-circle ml-2"></Badge>
      </OverlayTrigger>
    )
  }

  let button = null;

  if (props.options) {
    const labelKey = props.options?.[0]?.label ? 'label' : 'name';
    input = (
      <Typeahead
        id='typeahead_create'
        onChange={(selected?: Array<any>) => {
          if(selected && selected?.length > 0) {
            props.onSelect?.(selected[0]);
          }
        }}
        onInputChange={props.onChange}
        allowNew={true}
        labelKey={labelKey}
        options={props.options}
        value={props.value}
        selected={props.defaultSelected}
      />
    );
  } else {
    input = (
      <Form.Control
        type="plaintext"
        value={props.value}
        disabled={props.disabled}
        className="dbd-input-field"
        onChange={(e: ChangeEvent<any>) => props.onChange?.(e.target.value)}
      />
    );

    const pickDir = async () => {
      const dir = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
  
      if (!dir.canceled && dir.filePaths.length > 0) {
        props.onChange?.(dir.filePaths[0]);
      }
    };

    if (props.pathPicker) {
      button = (<Button variant="secondary" className="ml-2" onClick={pickDir}>
        Browse
      </Button>)
    }
  }
  return (
    <Form.Group>
      <InputWrapper>
        <Form.Label className="field-label-text">{props.label}</Form.Label>
        {tooltip}
        <InputValueWrapper>{input}</InputValueWrapper>
        {button}
      </InputWrapper>
    </Form.Group>
  );
}
