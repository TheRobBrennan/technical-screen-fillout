import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { redirectToFilteredResponses, getFilteredResponses } from './filloutController';
import * as filloutService from '../../services/fillout/filloutService';

// Mock responses for testing
const mockResponses = await import('../../services/fillout/mocks/responses.json');

// Mock our Fillout service
vi.mock('../../services/fillout/filloutService', () => ({
  fetchAllFormResponses: vi.fn(),
  saveFormResponsesToFile: vi.fn(),
  applyFiltersToResponses: vi.fn()
}));

describe('filloutController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    vi.resetAllMocks(); // Clear mocks

    mockRequest = { params: { formId: 'test-form' }, query: {} };
    mockResponse = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      redirect: vi.fn(),
    };

    // Default mock implementations
    vi.spyOn(filloutService, 'fetchAllFormResponses').mockResolvedValue([]);
    vi.spyOn(filloutService, 'saveFormResponsesToFile').mockImplementation(() => { });
    vi.spyOn(filloutService, 'applyFiltersToResponses').mockImplementation((responses, _) => responses);
  });

  describe('redirectToFilteredResponses', () => {
    it('redirects to the filteredResponses path', () => {
      process.env.FILLOUT_FORM_ID = 'test-form-id';
      redirectToFilteredResponses(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.redirect).toHaveBeenCalledWith(`/test-form-id/filteredResponses`);
    });
  });

  describe('getFilteredResponses', () => {
    it('fetches, filters, and saves form responses successfully', async () => {
      await getFilteredResponses(mockRequest as Request, mockResponse as Response);
      expect(filloutService.fetchAllFormResponses).toHaveBeenCalledWith('test-form');
      expect(filloutService.applyFiltersToResponses).toHaveBeenCalledWith([], []); // Adjust based on your mockResponses
      expect(filloutService.saveFormResponsesToFile).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('handles invalid filter format', async () => {
      mockRequest.query = { filters: 'not-a-valid-json' };
      await getFilteredResponses(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('Invalid filters format.');
    });

    it('handles errors while fetching form responses', async () => {
      vi.spyOn(filloutService, 'fetchAllFormResponses').mockRejectedValue(new Error('Network error'));
      await getFilteredResponses(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('An error occurred while fetching form responses.');
    });

    // Additional test for applying non-empty filters
    it('applies non-empty filters and returns filtered responses successfully', async () => {
      const filters = [{ id: "someId", condition: 'equals', value: "someValue" }];
      mockRequest.query = { filters: JSON.stringify(filters) };
      vi.spyOn(filloutService, 'fetchAllFormResponses').mockResolvedValue(mockResponses.default.responses);

      await getFilteredResponses(mockRequest as Request, mockResponse as Response);

      expect(filloutService.applyFiltersToResponses).toHaveBeenCalledWith(mockResponses.default.responses, filters);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.any(Array)); // Expecting an array response after filtering
    });
  });
});
