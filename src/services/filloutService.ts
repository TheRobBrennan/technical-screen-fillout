import https from 'https';
import fs from 'fs';
import path from 'path';

import { FilterClauseType, FormResponses, supportedQuestionTypes } from './types';

export const applyFiltersToResponses = (responses: FormResponses['responses'], filters: FilterClauseType[]) => {
  if (filters.length === 0) return responses; // Return early if no filters are provided

  // Iterate over each filter and apply it sequentially to the responses
  const filteredResponses = responses.map(response => {
    // Process each question in a response against all filters
    const processedQuestions = response.questions.map(question => {
      // Check if the question type is among the supported types
      if (!supportedQuestionTypes.includes(question.type)) {
        // Log a warning for unsupported question types
        console.warn(`Unrecognized question type: ${question.type} - response will not be filtered out.`);
        return question; // Return the question unfiltered
      } else {
        // For supported question types, apply each filter if applicable
        let isFiltered = false;
        filters.forEach(filter => {
          // Example filter application logic (you'll need to customize this)
          // Here we are not applying any specific filtering, but you can add your logic
          // isFiltered = true; if the question should be filtered out based on this filter's criteria
        });

        // If no filter has marked the question for filtering, return it
        return isFiltered ? null : question;
      }
    }).filter(q => q !== null); // Filter out questions marked by filters

    // Return the modified response with processed questions
    return {
      ...response,
      questions: processedQuestions,
    };
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