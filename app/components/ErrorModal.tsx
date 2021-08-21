import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { shell } from 'electron';

type MyProps = { show: any, onHide: any, title?: string, text:string, link ?: string };

function openLink(e: any) {
    e.preventDefault();
    let link = e.target.href;
    shell.openExternal(link);
  }

export default function ErrorModal(props: MyProps) {
	const link = (props.link?.length > 0) ? (
			<p>
				More information available at: <a href={props.link} onClick={(e) => openLink(e)}>this help page!</a>
			</p>
	) : null;
	return (
	  <Modal
		show={props.show}
		size="lg"
		onHide={props.onHide}
		aria-labelledby="contained-modal-title-vcenter"
		centered
	  >
		<Modal.Header closeButton>
		  <Modal.Title id="contained-modal-title-vcenter">
			Error
		  </Modal.Title>
		</Modal.Header>
		<Modal.Body>
		  <h4>{props?.title}</h4>
		  <p>
			{props.text}
		  </p>
		  {link}
		</Modal.Body>
		<Modal.Footer>
		  <Button variant="secondary" onClick={props.onHide}>Close</Button>
		</Modal.Footer>
	  </Modal>
	);
  }