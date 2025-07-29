import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remove initial loading indicator once React loads
const removeLoadingIndicator = () => {
  const loadingIndicator = document.querySelector('.loading-indicator') as HTMLElement;
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
    // Also remove it completely after animation
    setTimeout(() => {
      if (loadingIndicator.parentNode) {
        loadingIndicator.parentNode.removeChild(loadingIndicator);
      }
    }, 100);
  }
};

// Try to remove immediately
removeLoadingIndicator();

// Also try after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', removeLoadingIndicator);
} else {
  removeLoadingIndicator();
}

createRoot(document.getElementById("root")!).render(<App />);
