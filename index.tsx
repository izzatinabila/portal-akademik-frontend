import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Added .tsx extension to the import to be explicit. The main fix is providing content for App.tsx.
import App from './App.tsx';

// Wait for the DOM to be fully loaded before trying to mount the React app.
// This prevents the "Could not find root element" error.
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
