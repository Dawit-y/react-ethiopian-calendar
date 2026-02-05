import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// import './index.css' // Removed default vite css if not needed or keeping it if I want. Original example didn't have it in main.jsx but assumed it's not needed if App imports bootstrap.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
