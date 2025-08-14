import './polyfills'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ActorProvider } from './context/ActorContext'
import './index.css'
import './app.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ActorProvider>
      <App />
    </ActorProvider>
  </React.StrictMode>,
)
