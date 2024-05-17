import '@/plugins/msw';

import ReactDOM from 'react-dom/client';
import App from './app/App.tsx';

import '@fontsource/darker-grotesque/800.css';
import '@fontsource-variable/inter';

import './css/colors.css';
import './css/colors-var.css';
import './css/index.css';
import './css/input.css';
import './css/label.css';
import './css/textarea.css';
import './css/scrollbar.css';
import './css/animation.css';
import './css/button.css';
import './css/interaction.css';
import './css/layout.css';
import './css/monaco.css';
import "./utils/session/startup.ts"

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)

