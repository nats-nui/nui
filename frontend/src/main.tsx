import '@/plugins/msw';

import ReactDOM from 'react-dom/client';
import App from './app/App.tsx';

import '@fontsource/darker-grotesque/800.css';
import '@fontsource-variable/inter';

import './css/index.css';
//import './css/colors.css';
//import './css/colors-var.css';
//import './css/interaction.css';

import './css/layout.css';
import './css/scrollbar.css';
import './css/monaco.css';
import "@priolo/jack/dist/style.css";
import './css/label.css';


import "./utils/session/startup.ts";




ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)

