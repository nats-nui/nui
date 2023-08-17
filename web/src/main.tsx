import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

import '@fontsource/darker-grotesque/800.css';
import './index.css'
import './plugins/msw';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
