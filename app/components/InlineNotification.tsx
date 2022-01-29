import React, { Component, useState, useEffect, useContext } from 'react';
import { ApiNotification, ApiNotifications } from '../api/ApiTypes';
import styled from 'styled-components';

type MyProps = {
    notification: ApiNotification;
};


export default function InlineNotification(props: MyProps) {
    return (
        <div>
           {props.notification.text}
        </div>
    );
}
