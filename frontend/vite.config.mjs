import { defineConfig, loadEnv, transformWithOxc } from 'vite';
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  return {
    plugins: [{ name: 'existing-jsx-files', enforce: 'pre', async transform(code, id) {
      if (/\/src\/.*\.js$/.test(id)) return transformWithOxc(code, id, { lang: 'jsx', jsx: { runtime: 'automatic' } });
    } }],
    define: { 'process.env.REACT_APP_API_URL': env.REACT_APP_API_URL === undefined ? 'undefined' : JSON.stringify(env.REACT_APP_API_URL) },
    server: { host: env.HOST || '127.0.0.1', port: 3000, strictPort: true },
    build: { outDir: 'build' },
    optimizeDeps: { rolldownOptions: { moduleTypes: { '.js': 'jsx' } } },
    test: { environment: 'jsdom', globals: true, setupFiles: ['./src/setupTests.js'], include: ['src/**/*.test.js'], clearMocks: true }
  };
});
