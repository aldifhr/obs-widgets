import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import LikeCounterWidget from './components/LikeCounterWidget';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LikeCounterWidget />
  </React.StrictMode>
);
