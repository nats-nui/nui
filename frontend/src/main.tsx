import '@/plugins/msw';

import ReactDOM from 'react-dom/client';
import App from './app/App.tsx';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import '@fontsource/darker-grotesque/800.css';
import '@fontsource-variable/inter';

import './css/index.css';
//import './css/colors.css';
//import './css/colors-var.css';
//import './css/interaction.css';

import './css/layout.css';
import './css/scrollbar.css';
import './css/monaco.css';
import "@priolo/jack/dist/jack.css";
import './css/label.css';

(globalThis as any).MonacoEnvironment = {
	getWorker: (_: string, label: string) => {
		if (label === 'json') {
			return new jsonWorker();
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return new cssWorker();
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return new htmlWorker();
		}
		if (label === 'typescript' || label === 'javascript') {
			return new tsWorker();
		}
		return new editorWorker();
	},
};

loader.config({ monaco });

import "./utils/session/startup.ts";




ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)

