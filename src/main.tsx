import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initUmami, UmamiSubscriber } from './analytics/umami'
import { subscribe } from './analytics/eventBus'

// Initialize Umami Analytics
initUmami();
subscribe(new UmamiSubscriber());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

