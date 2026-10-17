import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { PredictionsProvider } from './context/PredictionsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <PredictionsProvider>
        <App />
      </PredictionsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
