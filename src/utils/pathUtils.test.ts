import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';

describe('basePath', () => {
  let originalNodeEnv;
  let originalVercel;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    originalVercel = process.env.VERCEL;
    vi.resetModules(); // Clears the module cache before each test
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.VERCEL = originalVercel;
  });

  it('should use "/tmp" for production environment', async () => {
    process.env.NODE_ENV = 'production';
    const { basePath } = await import('./pathUtils');
    expect(basePath).toBe('/tmp');
  });

  it('should use "/tmp" when VERCEL environment variable is set', async () => {
    process.env.VERCEL = '1';
    const { basePath } = await import('./pathUtils');
    expect(basePath).toBe('/tmp');
  });

  it('should use a local path for non-production environments without VERCEL', async () => {
    delete process.env.NODE_ENV;
    delete process.env.VERCEL;
    const { basePath } = await import('./pathUtils');
    const expectedPath = path.join(__dirname, '../services/tmp');
    expect(basePath).toBe(expectedPath);
  });
});
