import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ActorProvider } from './context/ActorContext'
import { AuthProvider } from './context/AuthContext'
import { DAOProvider } from './context/DAOContext'
import './index.css'
import './app.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <DAOProvider>
        <ActorProvider>
          <App />
        </ActorProvider>
      </DAOProvider>
    </AuthProvider>
  </React.StrictMode>,
)
