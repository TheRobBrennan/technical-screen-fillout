import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import server from './server';

describe('Server & Middleware Configuration', () => {
  // Test if the server is running and can receive requests
  it('should start and respond to a GET request', async () => {
    const response = await request(server).get('/');
    expect(response.status).not.toBe(404);
  });

  // Test CORS Middleware
  it('should allow CORS', async () => {
    const response = await request(server).get('/');
    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  // Test if JSON is parsed correctly by the express.json() middleware
  it('should parse JSON body', async () => {
    const response = await request(server)
      .post('/') // Adjust this endpoint based on where you can test a POST request
      .send({ ping: 'pong' })
      .set('Accept', 'application/json');
    expect(response.status).not.toBe(415); // Ensures that the server accepts and processes JSON
    // Further validation can be added based on the response behavior
  });

  // Test Logging Middleware (morgan)
  // This one is trickier to test directly since morgan's primary function is to log to the console or a stream.
  // You might instead check if morgan is configured as middleware without a direct output test, or mock it to verify its use.

  // Test for URL encoded body parsing
  it('should parse URL encoded body', async () => {
    const response = await request(server)
      .post('/') // Adjust this endpoint similarly
      .send('key=value&key2=value2')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    expect(response.status).not.toBe(415); // Ensures server processes URL encoded bodies
    // Additional assertions can be added based on your API's behavior
  });
});

describe('Routes', () => {
  // Assuming your Ping route responds to a GET request at '/'
  it('Ping route should respond with correct JSON output', async () => {
    const response = await request(server).get('/');
    expect(response.status).toBe(200); // Check if the response status is 200 OK
    // Adjusted to parse the JSON and check if it matches the expected structure
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toHaveProperty('pong', 'Hello, World!');
    // If you want to be less strict about the exact timestamp, you could just check for its existence
    expect(responseBody).toHaveProperty('timestamp');
  });

  // Test other routes as necessary
});

// Optionally, add hooks to start and close the server if not handled globally
beforeAll(() => {
  // Code to run before all tests
});

afterAll(() => {
  // Code to shut down the server or any other cleanup
});
