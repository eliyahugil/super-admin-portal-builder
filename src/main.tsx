import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remove initial loading indicator once React loads
const loadingIndicator = document.querySelector('.loading-indicator');
if (loadingIndicator) {
  loadingIndicator.remove();
}

createRoot(document.getElementById("root")!).render(<App />);
