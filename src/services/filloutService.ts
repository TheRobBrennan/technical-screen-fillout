import https from 'https';
import fs from 'fs';
import path from 'path';

import { FilterClauseType, FormResponses } from './types';

export const applyFiltersToResponses = (responses: FormResponses['responses'], filters: FilterClauseType[]) => {
  return filters.reduce((filteredResponses, filter) => {
    return filteredResponses.filter(_ => {
      // TODO: Implement the logic to compare the response value with the filter value
      switch (filter.condition) {
        //       case 'equals':
        //         return responseValue === filter.value;
        //       case 'does_not_equal':
        //         return responseValue !== filter.value;
        //       case 'greater_than':
        //         return Number(responseValue) > Number(filter.value);
        //       case 'less_than':
        //         return Number(responseValue) < Number(filter.value);
        default:
          // In case of an unrecognized condition, don't filter out any responses
          console.warn(`Unrecognized condition: ${filter.condition} - response will not be filtered out.`);
          return true;
      }
    })
  }, responses);
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