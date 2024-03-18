import https from 'https';
import fs from 'fs';
import path from 'path';

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
