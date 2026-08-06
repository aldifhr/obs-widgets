import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import CommentWidget from './components/CommentWidget';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CommentWidget />
  </React.StrictMode>
);
