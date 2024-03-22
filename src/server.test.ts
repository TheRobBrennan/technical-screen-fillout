import { describe, expect, it } from 'vitest';
import request from 'supertest';
import server from './server';

describe('Fillout API routes', () => {
  // Assuming an environment variable FILLOUT_FORM_ID is set for testing
  const formId = process.env.FILLOUT_FORM_ID || 'testFormId';

  it('should redirect from "/" to "/:formId/filteredResponses"', async () => {
    const response = await request(server).get('/');
    // Check for redirection status
    expect(response.status).toBe(302); // or 301, depending on your redirection logic
    // Check if it redirects to the expected URL
    expect(response.headers.location).toBe(`/${formId}/filteredResponses`);
  });

  it('should respond with JSON on GET "/:formId/filteredResponses"', async () => {
    const response = await request(server).get(`/${formId}/filteredResponses`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.any(Object)); // Adjust based on actual response structure
  });

});
