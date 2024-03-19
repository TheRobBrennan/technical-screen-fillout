import https from 'https';
import fs from 'fs';
import path from 'path';

// Defined per the project requirements at https://fillout.notion.site/Software-engineering-assignment-fbd58fd78f59495c99866b91b1358221
type FilterClauseType = {
  id: string;
  condition: 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
  value: number | string;
};

export const applyFiltersToResponses = (responses: any[], filters: FilterClauseType[]) => {
  return filters.reduce((filteredResponses, filter) => {
    return filteredResponses.filter(response => {
      const responseValue = response[filter.id];
      switch (filter.condition) {
        case 'equals':
          return responseValue === filter.value;
        case 'does_not_equal':
          return responseValue !== filter.value;
        case 'greater_than':
          return Number(responseValue) > Number(filter.value);
        case 'less_than':
          return Number(responseValue) < Number(filter.value);
        default:
          // In case of an unrecognized condition, don't filter out any responses
          console.warn(`Unrecognized condition: ${filter.condition} - response will not be filtered out.`);
          return true;
      }
    });
  }, responses);
};

export const fetchAndSaveFormResponses = (formId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = `https://api.fillout.com/v1/api/forms/${formId}`;
    const apiKey = process.env.FILLOUT_API_KEY

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
          const formResponses = JSON.parse(data);

          // Determine the file path based on the environment
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

export const fetchFormResponses = (formId: string): Promise<any> => {
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
          const formResponses = JSON.parse(data);
          resolve(formResponses);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', error => reject(error));
  });
};

export const saveFormResponsesToFile = (formId: string, formResponses: any): void => {
  // FUTURE: Refactor into a separate function to allow for easier testing
  // Determine the file path based on the environment
  /* v8 ignore next 2 */
  const basePath = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/tmp' : './src/services/tmp';
  const filePath = path.join(basePath, `data-${formId}.json`);

  fs.writeFileSync(filePath, JSON.stringify(formResponses, null, 2), 'utf-8');
};
