import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import AlertCustomizer from './AlertCustomizer';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AlertCustomizer kind="share" />
  </React.StrictMode>
);
