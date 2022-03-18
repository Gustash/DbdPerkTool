import React from 'react';
import PackDisplay from './PackDisplay';

export default function Featured() {
  return (
    <PackDisplay featured={true} packsPerPage={48} />
  );
}
