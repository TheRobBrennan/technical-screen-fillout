import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // NOTE: Set silent to false to see console output during test execution
    silent: true
  },
});
