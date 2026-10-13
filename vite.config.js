import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Activa la transformación JSX automática para los componentes React.
export default defineConfig({
  plugins: [react()],
});
