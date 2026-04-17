import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color:      '#f1f1f6',
              border:     '1px solid rgba(108,99,255,0.3)',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0d0d14' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0d0d14' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
