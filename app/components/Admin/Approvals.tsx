import React from 'react';
import PackDisplay from '../PackDisplay';

export default function Approvals() {
  return (
    <PackDisplay unapprovedOnly={true}/>
  );
}
