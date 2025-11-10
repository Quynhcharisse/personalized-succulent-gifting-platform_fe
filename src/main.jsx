window.global = window;

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/index.js'
import { ConfirmProvider } from 'material-ui-confirm';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ConfirmProvider>
    <App />
    </ConfirmProvider>
  </Provider>
)
