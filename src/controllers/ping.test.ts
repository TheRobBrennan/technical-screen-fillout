import { describe, it, expect, vi } from 'vitest';
import pingController from './ping';

describe('pingController', () => {
  it('responds with pong and a timestamp', async () => {
    // Mock Express response
    const send = vi.fn();
    const status = vi.fn(() => ({ json: send }));
    const res = { status } as any;

    // Call the controller
    await pingController({} as any, res);

    // Assertions to ensure the controller behaves as expected
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      pong: "Hello, World!",
    }));
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      timestamp: expect.any(String)
    }));
  });
});
