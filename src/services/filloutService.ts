import https from 'https';
import fs from 'fs';
import path from 'path';

import { FilterClauseType, FormResponses, supportedQuestionTypes } from './types';

export const applyFiltersToResponses = (responses: FormResponses['responses'], filters: FilterClauseType[]) => {
  if (filters.length === 0) return responses; // Return early if no filters are provided

  // Filter responses based on the conditions, checking for supported question types
  const filteredResponses = responses.filter(response => {
    return response.questions.some(question => {
      // Check if the question type is supported
      if (!supportedQuestionTypes.includes(question.type)) {
        // Log a warning for unsupported question types and skip filtering for this question
        console.warn(`Unrecognized question type: ${question.type} - response will not be filtered out.`);
        return false; // Do not exclude the response based on this question
      }

      // Find if there's any matching filter for this supported question type
      const filter = filters.find(filter => filter.id === question.id && filter.condition === 'equals');
      if (!filter) return false; // No matching filter for this question

      // Apply the 'equals' filter for supported question types
      return question.value === filter.value;
    });
  });

  return filteredResponses;
};

export const fetchAndSaveFormResponses = (formId: string): Promise<FormResponses> => {
  return new Promise((resolve, reject) => {
    const url = `https://api.fillout.com/v1/api/forms/${formId}`;
    const apiKey = process.env.FILLOUT_API_KEY;

    https.get(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }, response => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const formResponses: FormResponses = JSON.parse(data); // Explicitly type the parsed data

          const basePath = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/tmp' : './src/services/tmp';
          const filePath = path.join(basePath, `data-${formId}.json`);

          fs.writeFileSync(filePath, JSON.stringify(formResponses, null, 2), 'utf-8');
          resolve(formResponses);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', error => reject(error));
  });
};

export const fetchFormResponses = (formId: string): Promise<FormResponses> => {
  return new Promise((resolve, reject) => {
    const url = `https://api.fillout.com/v1/api/forms/${formId}/submissions`;
    const apiKey = process.env.FILLOUT_API_KEY;

    https.get(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }, response => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const formResponses: FormResponses = JSON.parse(data); // Explicitly type the parsed data
          resolve(formResponses);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', error => reject(error));
  });
};

export const saveFormResponsesToFile = (formId: string, formResponses: FormResponses): void => {
  const basePath = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/tmp' : './src/services/tmp';
  const filePath = path.join(basePath, `data-${formId}.json`);

  fs.writeFileSync(filePath, JSON.stringify(formResponses, null, 2), 'utf-8');
};