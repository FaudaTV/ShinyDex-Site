import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.scss' // Vérifie que le nom correspond à ton fichier Sass
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
