import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, Mock } from 'vitest';
import * as filloutService from './filloutService';
import { FormResponses } from './types';

import https from 'https';
import path from 'path';
import EventEmitter from 'events';
import { SubmissionResponse, Question, QuestionType } from './types';

// Mocks
const mockResponses = await import('./mocks/responses.json');
const sampleResponses: SubmissionResponse[] = mockResponses.responses.map((response) => {
  const questions: Question[] = response.questions.map((question) => {
    const { type, ...rest } = question;
    return {
      type: type as QuestionType,
      ...rest,
    };
  });

  return {
    ...response,
    questions,
  };
});
vi.mock('https');

describe('filloutService', () => {
  describe('applyFiltersToResponses', () => {

    it('returns all responses if no filters are applied', () => {
      const filters = [];
      const filtered = filloutService.applyFiltersToResponses(sampleResponses, filters);
      expect(filtered).toEqual(sampleResponses);
    });

    it('warns about an unsupported question type', () => {
      // Spy on console.warn to check if it gets called with the expected message
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      // Create a sample response containing an unsupported question type
      const sampleResponsesWithUnsupportedType = [
        {
          submissionId: "exampleId1",
          submissionTime: "2024-02-27T19:37:08.228Z",
          lastUpdatedAt: "2024-02-27T19:37:08.228Z",
          questions: [
            {
              id: "unsupportedQuestionId",
              name: "Unsupported Question",
              type: "UnsupportedType", // This is the unsupported question type
              value: "Some value"
            }
          ],
          calculations: [],
          urlParameters: [],
          quiz: {},
          documents: []
        }
      ];

      // REMEMBER: We need at least one filter to trigger the filtering logic
      const filters = [{ id: "kc6S6ThWu3cT5PVZkwKUg4", condition: 'equals', value: "billy@fillout.com" }];

      // Call applyFiltersToResponses with the sample response and empty filters
      const filteredResponses = filloutService.applyFiltersToResponses(sampleResponsesWithUnsupportedType, filters);

      // Check if console.warn was called with the expected message
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Unrecognized question type: UnsupportedType - response will not be filtered out.'));

      // Check that the filtered responses contain the original response
      expect(filteredResponses.length).toBe(1);

      // Restore the original console.warn function
      consoleWarnSpy.mockRestore();
    });

    it('does not filter responses when an unknown filter condition is applied', () => {
      // Create a sample response containing an unsupported question type
      const sampleResponsesWithUnsupportedType = [
        {
          submissionId: "exampleId1",
          submissionTime: "2024-02-27T19:37:08.228Z",
          lastUpdatedAt: "2024-02-27T19:37:08.228Z",
          questions: [
            {
              id: "unsupportedQuestionId",
              name: "Unsupported Question",
              type: "UnsupportedType", // This is the unsupported question type
              value: "Some value"
            }
          ],
          calculations: [],
          urlParameters: [],
          quiz: {},
          documents: []
        }
      ];

      // REMEMBER: We need at least one filter to trigger the filtering logic
      const filters = [{ id: "kc6S6ThWu3cT5PVZkwKUg4", condition: 'unknown-condition', value: "billy@fillout.com" }];

      // Call applyFiltersToResponses with the sample response and empty filters
      const filteredResponses = filloutService.applyFiltersToResponses(sampleResponsesWithUnsupportedType, filters);

      // Check that the filtered responses contain the original response
      expect(filteredResponses.length).toBe(1);

    });

    it('ignores unknown filter conditions and logs a warning', () => {
      // This setup seems correct but ensure it matches the expected data structure
      const sampleResponses: SubmissionResponse[] = [
        {
          submissionId: "1",
          submissionTime: "2024-02-27T19:37:08.228Z",
          lastUpdatedAt: "2024-02-27T19:37:08.228Z",
          calculations: [],
          urlParameters: [],
          questions: [
            { id: "textQuestion", type: "ShortAnswer", value: "Response A", name: "Text Question" },
            { id: "numberQuestion", type: "NumberInput", value: "10", name: "Number Question" }
          ],
          documents: [],
          quiz: {} // Add the missing 'quiz' property
        },
        {
          submissionId: "2",
          submissionTime: "2024-02-27T19:37:08.228Z",
          lastUpdatedAt: "2024-02-27T19:37:08.228Z",
          calculations: [],
          urlParameters: [],
          questions: [
            { id: "textQuestion", type: "ShortAnswer", value: "Response B", name: "Text Question" },
            { id: "numberQuestion", type: "NumberInput", value: "20", name: "Number Question" }
          ],
          documents: [],
          quiz: {} // Add the missing 'quiz' property
        }
      ];

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const filters = [{ id: "textQuestion", condition: 'unknown_condition', value: "Response A" }];

      const filtered = filloutService.applyFiltersToResponses(sampleResponses, filters);

      expect(filtered.length).toBe(sampleResponses.length);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Unrecognized filter condition: unknown_condition - question will not be filtered out.'));
      consoleWarnSpy.mockRestore();
    });


    it('correctly filters responses using the equals filter for a specific questionId and email address', () => {
      // Define the filter for a specific questionId and email address
      const filters = [{ id: "kc6S6ThWu3cT5PVZkwKUg4", condition: 'equals', value: "johnny@fillout.com" }];

      // Call applyFiltersToResponses with the sample responses and the defined filter
      const filteredResponses = filloutService.applyFiltersToResponses(sampleResponses, filters);

      // Check that the filtered responses contain only the matching response
      expect(filteredResponses.length).toBe(1);
      const matchingQuestion = filteredResponses[0].questions.find(q => q.id === "kc6S6ThWu3cT5PVZkwKUg4");
      expect(matchingQuestion).toBeDefined();
      expect(matchingQuestion?.value).toBe("johnny@fillout.com");
    });
  });

  describe('fetchAllFormResponses', () => {
    const formId = 'test-multi-page-form';
    const mockApiKey = 'testApiKey';
    process.env.FILLOUT_API_KEY = mockApiKey;

    beforeEach(() => {
      vi.resetAllMocks(); // Reset mocks between tests
    });

    it('aggregates responses from multiple pages correctly', async () => {
      // Mock two pages of responses
      const mockPage1 = { responses: [{ id: '1', response: 'Response 1' }], pageCount: 2 };
      const mockPage2 = { responses: [{ id: '2', response: 'Response 2' }], pageCount: 2 };

      // Simulate successful https response
      let callCount = 0;
      const requestMock = vi.fn((url, options, callback) => {
        callCount++;
        const response = new EventEmitter();
        process.nextTick(() => {
          response.emit('data', JSON.stringify(callCount === 1 ? mockPage1 : mockPage2));
          response.emit('end');
        });
        callback(response);
        return { on: vi.fn() };
      });
      (https.get as Mock).mockImplementation(requestMock);

      const aggregatedResponses = await filloutService.fetchAllFormResponses(formId);
      expect(aggregatedResponses.length).toBe(2);
      expect(aggregatedResponses).toEqual([...mockPage1.responses, ...mockPage2.responses]);
      expect(callCount).toBe(2); // Ensure it was called twice for two pages
    });

    it('handles errors gracefully', async () => {
      const requestMock = vi.fn((url, options, callback) => {
        const req = new EventEmitter();
        process.nextTick(() => {
          req.emit('error', new Error('Network error'));
        });
        return req;
      });
      (https.get as Mock).mockImplementation(requestMock);

      await expect(filloutService.fetchAllFormResponses(formId)).rejects.toThrow('Failed to fetch form responses');
    });
  });

  describe('fetchFormResponses', () => {
    const formId = 'testFormId';
    const apiUrl = `https://api.fillout.com/v1/api/forms/${formId}/submissions`;
    const mockApiKey = 'testApiKey';

    beforeEach(() => {
      process.env.FILLOUT_API_KEY = mockApiKey;
      vi.resetAllMocks(); // Reset mocks between tests to prevent test interference
    });

    it('successfully fetches form responses', async () => {
      const mockResponses = [{ id: '1', response: 'Test Response' }];
      // Simulate successful https response
      const requestMock = vi.fn((url, options, callback) => {
        const response = new EventEmitter();
        process.nextTick(() => {
          response.emit('data', JSON.stringify(mockResponses));
          response.emit('end');
        });
        callback(response);
        return { on: vi.fn() };
      });
      (https.get as Mock).mockImplementation(requestMock);

      const responses = await filloutService.fetchFormResponses(formId);
      expect(https.get).toHaveBeenCalledWith(
        apiUrl,
        {
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
        },
        expect.any(Function)
      );
      expect(responses).toEqual(mockResponses);
    });

    it('handles JSON parsing error', async () => {
      // Simulate a JSON parsing error by returning invalid JSON
      (https.get as Mock).mockImplementation((url, options, callback) => {
        const response = new EventEmitter();
        process.nextTick(() => {
          response.emit('data', 'Invalid JSON');
          response.emit('end');
        });
        callback(response);
        return { on: vi.fn() };
      });

      await expect(filloutService.fetchFormResponses(formId))
        .rejects
        .toThrow(/Unexpected token/); // Use a regular expression to match part of the error message
    });

    it('handles network errors', async () => {
      // Simulate a network error
      (https.get as Mock).mockImplementation((url, options, callback) => {
        const req = new EventEmitter();
        process.nextTick(() => {
          req.emit('error', new Error('Network error'));
        });
        return req;
      });

      await expect(filloutService.fetchFormResponses(formId))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('saveFormResponsesToFile', () => {
    let joinSpy;

    beforeAll(() => {
      // Spy on path.join directly without altering its behavior
      joinSpy = vi.spyOn(path, 'join');
    });

    afterEach(() => {
      // Restore the original implementation after each test
      joinSpy.mockRestore();
    });

    it('saves form responses to a file', () => {
      // Create an object of type 'FormResponses' with the required properties
      const formResponses: FormResponses = {
        responses: sampleResponses,
        totalResponses: 1,
        pageCount: 1
      };

      // Call your function that uses path.join and pass the formResponses object
      filloutService.saveFormResponsesToFile('test-form', formResponses);

      // Now you can check if path.join was called as expected
      expect(joinSpy).toHaveBeenCalled();

      // Example assertion (adjust the path according to your function logic)
      expect(joinSpy).toHaveBeenCalledWith(expect.anything(), `data-test-form.json`);
    });
  });
});
