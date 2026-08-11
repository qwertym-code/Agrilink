import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ShopConfigProvider } from './context/ShopConfigContext.jsx';
import App from './App.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShopConfigProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ShopConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
