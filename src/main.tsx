import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initializeTaskCatalog } from './content/catalog'
import './styles.css'

async function startApp() {
  await initializeTaskCatalog()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

void startApp()
