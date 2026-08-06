import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AlertWidget from './components/AlertWidget';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AlertWidget kind="share" />
  </React.StrictMode>
);
