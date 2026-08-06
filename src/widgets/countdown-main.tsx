import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import CountdownWidget from './CountdownWidget';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CountdownWidget />
  </React.StrictMode>
);
