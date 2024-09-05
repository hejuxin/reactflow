import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @ 替代为 src
      "@": resolve(__dirname, "src"),
      // @component 替代为 src/component
      "@components": resolve(__dirname, "src/components"),
      "@assets": resolve(__dirname, "src/assets"),
      "@constants": resolve(__dirname, "src/constants"),
    },
  },
});
