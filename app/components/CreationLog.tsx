import React, { useEffect, useRef } from "react";
import { Form } from "react-bootstrap";

export default function CreationLog(props: { lines: string[] }) {
    const textRef = useRef<any>(null);

    useEffect(() => {
        if(textRef?.current) {
            textRef.current.scrollTop = textRef?.current.scrollHeight;
        }
    }, [props.lines]);

    return (
        <Form.Group className="mb-3 mt-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Activity Log</Form.Label>
            <Form.Control as="textarea" ref={textRef} className="text-monospace" rows={10} value={props.lines.join('\n')} readOnly />
        </Form.Group>
    )
}