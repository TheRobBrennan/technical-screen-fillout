// src/controllers/filloutController.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import * as filloutService from '../services/filloutService';
import { redirectToFilteredResponses, getFilteredResponses } from './filloutController';

// Define a custom mock interface that mirrors the needed Response methods
interface MockResponse {
  status: (code: number) => MockResponse;
  send: (body?: any) => MockResponse;
  json: (body: any) => MockResponse;
  redirect: (statusOrUrl: number | string, url?: string) => MockResponse;
}

// Create a mock response object with method chaining supported
const mockResponse = (): MockResponse => {
  const res: MockResponse = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
  };
  return res;
};

// Mocking the environment variable for form ID
process.env.FILLOUT_FORM_ID = 'testFormId';

describe('redirectToFilteredResponses', () => {
  it('should redirect to the filtered responses page with the correct form ID', () => {
    const res = mockResponse() as unknown as Response<any, Record<string, any>>; // Cast the mockResponse to Response<any, Record<string, any>> type
    redirectToFilteredResponses({} as Request, res);
    expect(res.redirect).toHaveBeenCalledWith('/testFormId/filteredResponses');
  });
});

describe('getFilteredResponses', () => {
  beforeEach(() => {
    // Reset all mocks to ensure a clean slate for each test
    vi.restoreAllMocks();
  });

  it('should return form responses successfully', async () => {
    const res = mockResponse() as unknown as Response<any, Record<string, any>>; // Cast the mockResponse to Response<any, Record<string, any>> type
    const req = { params: { formId: '123' } } as unknown as Request;

    const mockResponses = [{ id: 1, response: 'Test Response' }];
    // Mocking the service call to fetch and save form responses
    vi.spyOn(filloutService, 'fetchAndSaveFormResponses').mockResolvedValue(mockResponses);

    await getFilteredResponses(req, res);
    expect(filloutService.fetchAndSaveFormResponses).toHaveBeenCalledWith('123');
    expect(res.json).toHaveBeenCalledWith(mockResponses);
  });

  it('should handle errors when fetching form responses', async () => {
    const res = mockResponse() as unknown as Response<any, Record<string, any>>; // Cast the mockResponse to Response<any, Record<string, any>> type
    const req = { params: { formId: 'errorCase' } } as unknown as Request;

    const errorMessage = 'An error occurred';
    // Mocking a rejection to simulate an error during service execution
    vi.spyOn(filloutService, 'fetchAndSaveFormResponses').mockRejectedValue(new Error(errorMessage));

    await getFilteredResponses(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('An error occurred while fetching form responses.');
  });
});
