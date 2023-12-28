import ReactDOM from 'react-dom/client';
import App from './App.tsx';

import '@/plugins/msw';
import '@fontsource/darker-grotesque/800.css';
import './css/colors.css';
import './css/index.css';
import './css/input.css';
import './css/textarea.css';
import './css/scrollbar.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)