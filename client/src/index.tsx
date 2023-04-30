import React from 'react';
import ReactDOM from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from 'styled-components';
import { theme } from './utils/theme';
import Index from './components/App';
import reportWebVitals from './reportWebVitals';
import { RoomProvider } from './utils/room';
import './index.css';
import 'react-tooltip/dist/react-tooltip.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // <React.StrictMode>
  <ThemeProvider theme={theme}>
    <SnackbarProvider
      iconVariant={{
        success: '✅ ',
        error: '❌ ',
        warning: '⚠️ ',
        info: 'ℹ️ ️',
      }}
    >
      <RoomProvider>
        <Index />
      </RoomProvider>
    </SnackbarProvider>
  </ThemeProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
