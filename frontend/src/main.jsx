import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/nunito';
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/theme-socio.css';
import './styles/socio.css';
import './styles/illustrations.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
