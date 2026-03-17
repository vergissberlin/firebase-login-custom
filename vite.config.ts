import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/** CJS: make require() return the default export (the function) while keeping named exports on it */
function cjsDefaultExport() {
  return {
    name: 'cjs-default-export',
    generateBundle(_, bundle) {
      const cjs = Object.values(bundle).find(
        (f): f is { type: 'chunk'; fileName: string; code: string } =>
          f.type === 'chunk' && f.fileName.endsWith('.js') && !f.fileName.endsWith('.es.js')
      );
      if (cjs?.code) {
        cjs.code +=
          "\nif (typeof module !== 'undefined' && module.exports) { var _def = module.exports.default, _cls = module.exports.FirebaseLoginCustom; module.exports = _def; if (_def) { _def.default = _def; if (_cls !== undefined) _def.FirebaseLoginCustom = _cls; } }\n";
      }
    },
  };
}

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
  plugins: [
    dts({
      include: ['src'],
      exclude: ['**/__tests__/**'],
      outDir: 'dist',
      insertTypesEntry: false,
    }),
    cjsDefaultExport(),
  ],
});
