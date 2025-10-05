import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. Import the Provider component and your Redux store
import { Provider } from 'react-redux'
import { store } from './app/store.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap your entire App component in the Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)