import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import * as filloutService from './filloutService';
import { FilterClauseType, FormResponses } from './types';

import https from 'https';
import fs from 'fs';
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
vi.mock('fs');

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

  // Adjusting the test environment to match the expected file path logic
  describe('fetchAndSaveFormResponses', () => {
    const formId = 'test-form';
    const mockData: FormResponses = {
      responses: [
        // Your mock response objects structured according to the FormResponses type
      ],
      totalResponses: 1,
      pageCount: 1
    };

    beforeEach(() => {
      process.env.FILLOUT_API_KEY = 'testApiKey';

      // Set or unset environment variables to match the expected environment for the file path
      // For example, to match "src/services/tmp/data-test-form.json", ensure neither VERCEL nor NODE_ENV is set to 'production'
      delete process.env.VERCEL;
      process.env.NODE_ENV = 'test'; // Ensure it does not equal 'production'

      // Reset all mocks
      vi.resetAllMocks();

      // Mock https.get implementation
      https.get.mockImplementation((url, options, callback) => {
        const resp = new EventEmitter();
        process.nextTick(() => {
          resp.emit('data', JSON.stringify(mockData));
          resp.emit('end');
        });
        callback(resp);
        return { on: vi.fn() };
      });

      // Mock fs.writeFileSync to avoid filesystem operations
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => { });

      // Adjust the expected file path based on the logic your service uses to compute it
      const expectedFilePath = 'src/services/tmp/data-test-form.json';
      vi.spyOn(path, 'join').mockReturnValue(expectedFilePath);
    });

    it('successfully fetches and saves form responses', async () => {
      await expect(filloutService.fetchAndSaveFormResponses(formId)).resolves.toEqual(mockData);

      const expectedFilePath = 'src/services/tmp/data-test-form.json'; // Ensure this matches your service logic or beforeEach mock
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedFilePath,
        JSON.stringify(mockData, null, 2),
        'utf-8'
      );
    });

    it('rejects the promise on a network error', async () => {
      // Mock https.get to simulate a network error
      https.get.mockImplementation((url, options, callback) => {
        const req = new EventEmitter();
        process.nextTick(() => {
          req.emit('error', new Error('Network error'));
        });
        return req;
      });

      // Assert that the promise is rejected with the expected error
      await expect(filloutService.fetchAndSaveFormResponses(formId)).rejects.toThrow('Network error');

      // Optionally, verify that no file was attempted to be written
      // This requires mocking fs.writeFileSync and ensuring it was not called
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => { });
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('rejects the promise on JSON parsing error', async () => {
      // Mock https.get to simulate receiving invalid JSON
      https.get.mockImplementation((url, options, callback) => {
        const resp = new EventEmitter();
        process.nextTick(() => {
          // Emitting data that will cause a JSON.parse error
          resp.emit('data', 'Invalid JSON Data');
          resp.emit('end');
        });
        callback(resp);
        return { on: vi.fn() };
      });

      // Assert that the promise is rejected due to a JSON parsing error
      await expect(filloutService.fetchAndSaveFormResponses(formId))
        .rejects
        .toThrow(SyntaxError);

      // Optionally, verify that no attempt was made to write the file
      // This check ensures that the function stops execution after the error
      expect(fs.writeFileSync).not.toHaveBeenCalled();
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
      https.get.mockImplementation(requestMock);

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
      https.get.mockImplementation((url, options, callback) => {
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
      https.get.mockImplementation((url, options, callback) => {
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
      // Call your function that uses path.join
      filloutService.saveFormResponsesToFile('test-form', [{ id: '1', answer: 'Yes' }]);

      // Now you can check if path.join was called as expected
      expect(joinSpy).toHaveBeenCalled();

      // Example assertion (adjust the path according to your function logic)
      expect(joinSpy).toHaveBeenCalledWith(expect.anything(), `data-test-form.json`);
    });
  });
});
