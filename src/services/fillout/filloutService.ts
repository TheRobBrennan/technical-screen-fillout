import https from 'https';
import fs from 'fs';
import path from 'path';
import { basePath } from '../../utils/pathUtils';
import { handleEqualsCondition } from './filters/handleEqualsCondition';
import { handleDoesNotEqualCondition } from './filters/handleDoesNotEqualCondition';
import { handleGreaterThanCondition } from './filters/handleGreaterThanCondition';
import { handleLessThanCondition } from './filters/handleLessThanCondition';

import { FilterClauseType, FormResponses, supportedQuestionTypes, ConditionCheck } from './types';

// FUTURE: Add additional filtering as needed
const conditionChecks: Record<string, ConditionCheck> = {
  /*
  Note: Fillout forms sometimes have things other than question answers in the responses, but you can assume 
  for this assignment, that the ids to filter by will only ever correspond to form questions, 
  where the values are either string, number, or strings which are ISO dates
  */
  'equals': handleEqualsCondition,
  'does_not_equal': handleDoesNotEqualCondition,
  'greater_than': handleGreaterThanCondition,
  'less_than': handleLessThanCondition,
};

export const applyFiltersToResponses = (responses: FormResponses['responses'], filters: FilterClauseType[]): FormResponses['responses'] => {
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
        const conditionCheck = conditionChecks[filter.condition as keyof typeof conditionChecks];

        if (conditionCheck) {
          return conditionCheck(question, filter.value as string);
        } else {
          console.warn(`Unrecognized filter condition: ${filter.condition} - question will not be filtered out.`);
          return true; // If condition is unrecognized, do not filter out the response
        }
      });
    });
  });

  return filteredResponses;
};

export const fetchAllFormResponses = async (formId: string, offset = 0, allResponses: FormResponses['responses'] = []): Promise<FormResponses['responses']> => {
  const entriesPerPage = 150;
  const url = `https://api.fillout.com/v1/api/forms/${formId}/submissions?offset=${offset}`;
  const apiKey = process.env.FILLOUT_API_KEY;

  try {
    const response = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', error => reject(error));
    });

    const formResponses: FormResponses = response as FormResponses;
    allResponses = allResponses.concat(formResponses.responses);

    // Check if there are more entries to fetch based on the pageCount
    if (formResponses.pageCount > (offset / entriesPerPage) + 1) {
      // Increment the offset for the next page and fetch more responses
      return fetchAllFormResponses(formId, offset + entriesPerPage, allResponses);
    }

    return allResponses;
  } catch (error) {
    console.error(`Failed to fetch form responses: ${error}`);
    throw new Error('Failed to fetch form responses');
  }
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