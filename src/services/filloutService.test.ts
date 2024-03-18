import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAndSaveFormResponses } from './filloutService';
import https from 'https';
import fs from 'fs';
import path from 'path';

// Mocks
vi.mock('https');
vi.mock('fs');
vi.mock("path", async (importOriginal) => {
  const actual = await importOriginal();
  return actual;
});

describe('fetchAndSaveFormResponses', () => {
  const formId = 'test-form-id';
  const dummyData = [{ id: 1, response: 'Test response' }];

  beforeEach(() => {
    process.env.FILLOUT_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('successfully fetches and saves form responses', async () => {
    const responseEmitter = new (require('events').EventEmitter)();
    const requestEmitter = new (require('events').EventEmitter)();

    vi.spyOn(https, 'get').mockImplementation((url, options, callback) => {
      callback!(responseEmitter);
      process.nextTick(() => {
        responseEmitter.emit('data', JSON.stringify(dummyData));
        responseEmitter.emit('end');
      });
      return requestEmitter;
    });

    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => { });

    const result = await fetchAndSaveFormResponses(formId);

    expect(result).toEqual(dummyData);
    expect(fs.writeFileSync).toHaveBeenCalledOnce()
  });

  it('handles JSON parsing errors', async () => {
    const responseEmitter = new (require('events').EventEmitter)();
    const requestEmitter = new (require('events').EventEmitter)();

    vi.spyOn(https, 'get').mockImplementation((url, options, callback) => {
      callback!(responseEmitter);
      process.nextTick(() => {
        responseEmitter.emit('data', 'invalid JSON');
        responseEmitter.emit('end');
      });
      return requestEmitter;
    });

    await expect(fetchAndSaveFormResponses(formId)).rejects.toThrow(SyntaxError);

    // Ensure that fs.writeFileSync was not called
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('handles network errors gracefully', async () => {
    const requestError = new Error('Request failed');
    const requestEmitter = new (require('events').EventEmitter)();

    vi.spyOn(https, 'get').mockImplementation((url, options, callback) => {
      process.nextTick(() => {
        requestEmitter.emit('error', requestError);
      });
      // Return requestEmitter instead of creating a new instance
      return requestEmitter;
    });

    await expect(fetchAndSaveFormResponses(formId)).rejects.toThrow(requestError);
  });
});
