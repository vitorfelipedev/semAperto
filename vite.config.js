import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        transacoes: resolve(__dirname, 'transacoes.html'),
        metas: resolve(__dirname, 'metas.html'),
      },
    },
  },
});
