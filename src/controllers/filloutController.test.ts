import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { redirectToFilteredResponses, getFilteredResponses } from './filloutController';
import * as filloutService from '../services/filloutService';

// Mock responses
const mockResponses = await import('../services/mocks/responses.json');

// Mock the service functions
vi.mock('../services/filloutService', () => ({
  fetchFormResponses: vi.fn(),
  saveFormResponsesToFile: vi.fn(),
  applyFiltersToResponses: vi.fn()
}));

describe('filloutController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    vi.resetAllMocks(); // Reset mocks to clear previous test effects

    // Setup default mock implementations
    vi.spyOn(filloutService, 'fetchFormResponses').mockResolvedValue(mockResponses);

    vi.spyOn(filloutService, 'saveFormResponsesToFile').mockImplementation(() => { });
    vi.spyOn(filloutService, 'applyFiltersToResponses').mockImplementation((responses, _) => responses); // Simulate filter application

    mockRequest = { params: {}, query: {} };
    mockResponse = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
  });

  describe('redirectToFilteredResponses', () => {
    beforeEach(() => {
      // Reset all mocks
      vi.resetAllMocks();

      // Setup default mock implementations for each test case
      mockResponse = {
        // @ts-ignore
        redirect: vi.fn(), // Ensure this mock is properly set up
        json: vi.fn(),
        status: vi.fn().mockReturnThis(), // Chainable
        send: vi.fn().mockReturnThis(), // Chainable
      };
    });

    it('redirects to the filteredResponses path', () => {
      process.env.FILLOUT_FORM_ID = 'test-form-id';
      redirectToFilteredResponses(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.redirect).toHaveBeenCalledWith(`/test-form-id/filteredResponses`);
    });
  });

  describe('getFilteredResponses', () => {
    it('fetches and saves form responses successfully', async () => {
      mockRequest.params = { formId: 'test-form' };
      await getFilteredResponses(mockRequest as Request, mockResponse as Response);
      expect(filloutService.fetchFormResponses).toHaveBeenCalledWith('test-form');
      expect(filloutService.saveFormResponsesToFile).toHaveBeenCalledWith('test-form', expect.any(Object));
      expect(mockResponse.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it('handles invalid filter format', async () => {
      mockRequest.query = { filters: 'not-a-valid-json' };
      mockRequest.params = { formId: 'test-form' };
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

    it('applies filters and returns filtered responses successfully', async () => {
      const filters = [{ id: "kc6S6ThWu3cT5PVZkwKUg4", condition: 'equals', value: "johnny@fillout.com" }];
      mockRequest.query = { filters: JSON.stringify(filters) };
      mockRequest.params = { formId: 'test-form' };

      await getFilteredResponses(mockRequest as Request, mockResponse as Response);

      expect(filloutService.applyFiltersToResponses).toHaveBeenCalledWith(
        expect.any(Object), // Since fetchFormResponses mock returns an object, expect any object here
        filters
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
