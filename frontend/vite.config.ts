import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  define: {
    "__SERVER_BASE__": JSON.stringify("http://127.0.0.1:8080")
  }
});
