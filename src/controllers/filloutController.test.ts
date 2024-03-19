import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { redirectToFilteredResponses, getFilteredResponses } from './filloutController';
import * as filloutService from '../services/filloutService';

// Mock the service functions
vi.mock('../services/filloutService', () => ({
  fetchFormResponses: vi.fn(),
  saveFormResponsesToFile: vi.fn()
}));

// Mock Express Request and Response objects
let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;

describe('filloutController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: unknown;

  beforeEach(() => {
    responseJson = null;

    mockRequest = {};
    mockResponse = {
      // @ts-ignore - We're mocking the redirect object
      redirect: vi.fn(),
      status: vi.fn().mockReturnThis(), // Chainable
      send: vi.fn().mockReturnThis(), // Chainable
      json: vi.fn().mockImplementation(result => {
        responseJson = result;
      })
    };
  });

  describe('redirectToFilteredResponses', () => {
    it('redirects to the filteredResponses path', () => {
      process.env.FILLOUT_FORM_ID = 'test-form-id';
      redirectToFilteredResponses(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.redirect).toHaveBeenCalledWith(`/test-form-id/filteredResponses`);
    });
  });

  describe('getFilteredResponses', () => {
    // This runs before each test, setting up the mocks fresh
    beforeEach(() => {
      // Reset all mocks to ensure clean state
      vi.resetAllMocks();

      // Setup default mock implementations
      vi.spyOn(filloutService, 'fetchFormResponses').mockResolvedValue(['response1', 'response2']);
      vi.spyOn(filloutService, 'saveFormResponsesToFile').mockImplementation(() => { });
      vi.spyOn(console, 'log').mockImplementation(() => { });

      // Initialize mock request and response
      mockRequest = { params: {}, query: {} };
      mockResponse = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis()
      };
    });

    it('fetches and saves form responses successfully', async () => {
      mockRequest.params = { formId: 'test-form' };
      vi.spyOn(filloutService, 'fetchFormResponses').mockResolvedValue(['response1', 'response2']);
      await getFilteredResponses(mockRequest as Request, mockResponse as Response);
      expect(filloutService.fetchFormResponses).toHaveBeenCalledWith('test-form');
      expect(filloutService.saveFormResponsesToFile).toHaveBeenCalledWith('test-form', ['response1', 'response2']);
      expect(mockResponse.json).toHaveBeenCalledWith(['response1', 'response2']);
    });

    it('handles invalid filter format', async () => {
      mockRequest = {
        ...mockRequest,
        query: { filters: 'not-a-valid-json' },
        params: { formId: 'test-form' }
      };
      await getFilteredResponses(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('Invalid filters format.');
    });

    it('handles errors while fetching form responses', async () => {
      mockRequest.params = { formId: 'test-form' };
      vi.spyOn(filloutService, 'fetchFormResponses').mockRejectedValue(new Error('Network error'));
      await getFilteredResponses(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('An error occurred while fetching form responses.');
    });

    it('logs filters when they are provided', async () => {
      const mockFilters = [{ field: 'testField', operator: 'equals', value: 'testValue' }];
      mockRequest.params = { formId: 'test-form' };
      mockRequest.query = { filters: JSON.stringify(mockFilters) };
      vi.spyOn(filloutService, 'fetchFormResponses').mockResolvedValue(['response1', 'response2']);

      await getFilteredResponses(mockRequest as Request, mockResponse as Response);

      expect(console.log).toHaveBeenCalledWith(`TODO: Apply filters to responses: ${JSON.stringify(mockFilters, null, 2)}`);
      expect(filloutService.fetchFormResponses).toHaveBeenCalledWith('test-form');
      expect(filloutService.saveFormResponsesToFile).toHaveBeenCalledWith('test-form', ['response1', 'response2']);
      expect(mockResponse.json).toHaveBeenCalledWith(['response1', 'response2']);
    });

    it('does not log filters when they are not provided', async () => {
      mockRequest.params = { formId: 'test-form' };
      vi.spyOn(filloutService, 'fetchFormResponses').mockResolvedValue(['response1', 'response2']);

      await getFilteredResponses(mockRequest as Request, mockResponse as Response);

      expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('TODO: Apply filters to responses:'));
      expect(filloutService.fetchFormResponses).toHaveBeenCalledWith('test-form');
      expect(filloutService.saveFormResponsesToFile).toHaveBeenCalledWith('test-form', ['response1', 'response2']);
      expect(mockResponse.json).toHaveBeenCalledWith(['response1', 'response2']);
    });

    // Note: Consider resetting mocks and spies as needed, especially if their behavior might affect other tests.

  });
});
