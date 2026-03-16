import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/firebase-login-custom.ts'),
      name: 'FirebaseLoginCustom',
      fileName: 'firebase-login-custom',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: ['firebase-token-generator'],
      output: {
        globals: {
          'firebase-token-generator': 'FirebaseTokenGenerator',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [dts({ include: ['src'], outDir: 'dist', insertTypesEntry: false })],
});
