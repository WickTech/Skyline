import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Same output dir as Create React App, so the existing Vercel project
  // settings (framework preset / output directory) keep working unchanged.
  build: { outDir: 'build' },
  server: { port: 3000 },
  test: { environment: 'node', include: ['src/**/*.test.js'] },
});
