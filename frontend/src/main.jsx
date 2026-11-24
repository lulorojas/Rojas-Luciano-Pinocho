import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/big-shoulders-display/700';
import '@fontsource/big-shoulders-display/800';
import '@fontsource/big-shoulders-display/900';
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/club.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
