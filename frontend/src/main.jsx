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
              background:   '#202020',
              color:        '#FFFFFF',
              border:       '1px solid rgba(229,69,3,0.25)',
              borderRadius: '16px',
              fontFamily:   "'Poppins', sans-serif",
              fontSize:     '0.875rem',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#202020' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#202020' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
