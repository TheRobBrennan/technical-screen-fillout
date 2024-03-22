import https from 'https';
import fs from 'fs';
import path from 'path';

import { FilterClauseType, FormResponses, supportedQuestionTypes } from './types';

export const applyFiltersToResponses = (responses: FormResponses['responses'], filters: FilterClauseType[]) => {
  if (filters.length === 0) return responses; // Return early if no filters are provided

  const filteredResponses = responses.filter(response => {
    // Ensure response.questions is always treated as an array
    const questions = response.questions || [];

    return questions.some(question => {
      if (!supportedQuestionTypes.includes(question.type)) {
        console.warn(`Unrecognized question type: ${question.type} - response will not be filtered out.`);
        return true;
      }

      // Iterate over each filter to apply it if applicable
      return filters.some(filter => {
        if (filter.id !== question.id) return false; // Skip if the filter does not apply to the question

        switch (filter.condition) {
          case 'equals':
            return question.value === filter.value;

          // TODO: Implement filters for other conditions
          // case 'does_not_equal':
          //   return question.value !== filter.value;
          // case 'greater_than':
          //   return parseFloat(question.value) > parseFloat(filter.value);
          // case 'less_than':
          //   return parseFloat(question.value) < parseFloat(filter.value);

          // DEFAULT: Do not filter out the response
          default:
            console.warn(`Unrecognized filter condition: ${filter.condition} - question will not be filtered out.`);
            return true;
        }
      });
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

          /* v8 ignore next 2 */
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
  /* v8 ignore next 2 */
  const basePath = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/tmp' : './src/services/tmp';
  const filePath = path.join(basePath, `data-${formId}.json`);

  fs.writeFileSync(filePath, JSON.stringify(formResponses, null, 2), 'utf-8');
};