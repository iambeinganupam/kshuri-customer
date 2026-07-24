import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

const portalReact = path.resolve(__dirname, 'node_modules/react');
const portalReactDom = path.resolve(__dirname, 'node_modules/react-dom');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './') },
      { find: /^react$/, replacement: path.join(portalReact, 'index.js') },
      { find: /^react\/jsx-runtime$/, replacement: path.join(portalReact, 'jsx-runtime.js') },
      { find: /^react\/jsx-dev-runtime$/, replacement: path.join(portalReact, 'jsx-dev-runtime.js') },
      { find: /^react-dom$/, replacement: path.join(portalReactDom, 'index.js') },
      { find: /^react-dom\/client$/, replacement: path.join(portalReactDom, 'client.js') },
      { find: /^react-dom\/test-utils$/, replacement: path.join(portalReactDom, 'test-utils.js') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  ssr: {
    noExternal: [/@radix-ui\//, '@testing-library/react', '@testing-library/dom', 'cmdk'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['{components,lib,app,hooks}/**/*.test.{ts,tsx}'],
    deps: {
      optimizer: {
        web: {
          enabled: true,
          include: [
            '@testing-library/react',
            '@testing-library/dom',
            'react',
            'react-dom',
            'react-dom/client',
            'react-dom/test-utils',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            'lucide-react',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dialog > *',
            'cmdk',
            'cmdk > *',
          ],
        },
      },
    },
  },
});
