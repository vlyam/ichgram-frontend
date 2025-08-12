import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import ScrollToTop from '../shared/components/ScrollToTop/ScrollToTop.jsx';
import App from './App.jsx';
import { UIProvider } from '../shared/context/UIContext';

import store, { persistor } from '../redux/store';
import '../shared/styles/styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <UIProvider>
            <ScrollToTop />
            <App />
          </UIProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);