import https from 'https';
import fs from 'fs';
import path from 'path';
import { basePath } from '../utils/pathUtils';

import { FilterClauseType, FormResponses, supportedQuestionTypes } from './types';

// Define a type for the condition check functions
// TODO: Move this to our types file
type ConditionCheck = (questionValue: string, filterValue: string) => boolean;

// Implement a map of condition check functions
const conditionChecks: Record<string, ConditionCheck> = {
  'equals': (questionValue, filterValue) => questionValue === filterValue,
  'does_not_equal': (questionValue, filterValue) => questionValue !== filterValue,
  'greater_than': (questionValue, filterValue) => parseFloat(questionValue) > parseFloat(filterValue),
  'less_than': (questionValue, filterValue) => parseFloat(questionValue) < parseFloat(filterValue),
};

export const applyFiltersToResponses = (responses: FormResponses['responses'], filters: FilterClauseType[]) => {
  if (filters.length === 0) return responses; // Return early if no filters are provided

  const filteredResponses = responses.filter(response => {
    const questions = response.questions;

    return questions.some(question => {
      if (!supportedQuestionTypes.includes(question.type)) {
        console.warn(`Unrecognized question type: ${question.type} - response will not be filtered out.`);
        return true;
      }

      // Iterate over each filter to apply it if applicable
      return filters.some(filter => {
        if (filter.id !== question.id) return false; // Skip if the filter does not apply to the question

        // Iterate over each filter to apply it if applicable
        return filters.some(filter => {
          if (filter.id !== question.id) return false; // Skip if the filter does not apply to the question

          const conditionCheck = conditionChecks[filter.condition as keyof typeof conditionChecks]; // Explicitly type the index
          if (conditionCheck) {
            return conditionCheck(question.value as string, filter.value as string);
          } else {
            console.warn(`Unrecognized filter condition: ${filter.condition} - question will not be filtered out.`);
            return true; // If condition is unrecognized, do not filter out the response
          }
        });

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
  const filePath = path.join(basePath, `data-${formId}.json`);

  fs.writeFileSync(filePath, JSON.stringify(formResponses, null, 2), 'utf-8');
};