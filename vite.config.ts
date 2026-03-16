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
          "\nif (typeof module !== 'undefined' && module.exports) { var d = module.exports.default, c = module.exports.FirebaseLoginCustom; module.exports = d; if (d) { d.default = d; if (c !== undefined) d.FirebaseLoginCustom = c; } }\n";
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
  plugins: [dts({ include: ['src'], outDir: 'dist', insertTypesEntry: false }), cjsDefaultExport()],
});
