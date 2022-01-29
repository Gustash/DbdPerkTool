import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ReactHtmlParser from 'react-html-parser';
import MarkdownIt from 'markdown-it';
import settingsUtil from '../settings/Settings';

const md = new MarkdownIt();

export enum NotificationType {
  Global,
  User
};

type MyProps = UserNotification | GlobalNotification;

type CommonNotification = {
  show: any;
  onHide: any;
  title: string;
  text: string;
};

type UserNotification = CommonNotification & {
  type: NotificationType.User;
}

type GlobalNotification = CommonNotification & {
  id: string;
  type: NotificationType.Global;
}

export default function Notification(props: MyProps) {
  const dismiss = async () => {
    if (props.type === NotificationType.Global) {
      settingsUtil.settings.lastNotificationRead = props.id;
      await settingsUtil.save();
    }
    props.onHide();
  };
  return (
    <Modal
      show={props.show}
      size="lg"
      onHide={dismiss}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{ReactHtmlParser(md.render(props.text))}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={dismiss}>
          Dismiss
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
