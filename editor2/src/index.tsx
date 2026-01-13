import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App/App';
import { EditorProvider } from './context/EditorContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EditorProvider>
      <App />
    </EditorProvider>
  </React.StrictMode>
);
