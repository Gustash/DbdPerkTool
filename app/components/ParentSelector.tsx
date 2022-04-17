import React from "react";
import PlainTextInput, { InputValueWrapper, InputWrapper } from "./Form/PlainTextInput";
import { Typeahead } from 'react-bootstrap-typeahead';
import { Form } from "react-bootstrap";

type MyProps = {
    onSetParent: (pack: any) => void;
    packs: Array<any>;
    defaultSelected?: any;
}

export function buildPackLabel(pack: any) {
    return { ...pack, label: `${pack.author} - ${pack.name}` };
}

export function ParentSelector(props: MyProps) {
    const input = <Typeahead
        id='typeahead_create'
        onChange={(selected?: Array<any>) => {
            if (selected && selected?.length > 0) {
                const targetPack = selected[0];
                props.onSetParent(targetPack);
            }
        }}
        allowNew={false}
        labelKey={'label'}
        options={props.packs}
        defaultSelected={props.defaultSelected ? [props.defaultSelected] : undefined}
    />

    return (
        <Form.Group>
            <InputWrapper>
                <Form.Label className="field-label-text">Parent</Form.Label>
                <InputValueWrapper>
                    {input}
                </InputValueWrapper>
            </InputWrapper>
        </Form.Group>)

}