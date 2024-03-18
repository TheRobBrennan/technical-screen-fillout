# Welcome

An example [Express.JS](https://expressjs.com) and [TypeScript](https://www.typescriptlang.org) application ready for deployment to [Vercel](https://vercel.com/).

You can view the [DEMO](https://technical-screen-fillout.vercel.app) application hosted on [Vercel](https://vercel.com/) at [https://technical-screen-fillout.vercel.app](https://technical-screen-fillout.vercel.app)

## Getting started

As long as you have [Node.JS](https://nodejs.org/) installed on your development environment, you can get this project up and running by running the following:

```sh
# Check to make sure Node.js and npm is installed
% node -v
v20.11.1

% npm -v
10.2.4

# Create and define environment variables in your own .env file
% cp .env.example .env

# Install dependencies
% npm install
```

Once you have the project dependencies installed, you can start the application by running:

```sh
# Run the development script
% npm run dev

> technical-screen-fillout@0.0.0 dev
> nodemon ./src/server.ts

[nodemon] 3.0.2
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node ./src/server.ts`
Server running on: http://localhost:3000

```

In the above example, you can open your browser to [http://localhost:3000](http://localhost:3000) and view the default content from the server 🤓

## Folder Structure

```sh
.
├── api
│   └── index.ts
├── src
│   ├── controllers
│   │   ├── ping.ts
│   ├── routes
│   │   ├── ping.ts
│   └── server.ts
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── vercel.json
└── vitest.config.mts
```

## Testing

I will use [vitest](https://vitest.dev) and [SuperTest](https://www.npmjs.com/package/supertest) to run tests and generate code coverage reports for this example.

```sh
# Install Vitest, SuperTest, and the types for SuperTest
npm install --save-dev vitest supertest @types/superest
```

If you are eager to run the test suite and/or see the code coverage report:

```sh
# Run the test suite
npm test

# OPTIONAL: Generate code coverage for the test suite
npm run test:coverage

# OPTIONAL: Generate code coverage for the test suite and open the HTML report
npm run test:coverage:open

```

## Review the requirements

- [Express.js](https://expressjs.com) is the preferred framework for their APIs; however any framework can be used
- Create a single endpoint `/{formId}/filteredResponses` to respond to `GET` requests
  - Query parameters accepted should match [https://www.fillout.com/help/fillout-rest-api#620db33e79744413af4acef27e5f0f78](https://www.fillout.com/help/fillout-rest-api#620db33e79744413af4acef27e5f0f78) with the addition of a `filters` parameter

```ts
type FilterClauseType = {
 id: string;
 condition: 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
 value: number | string;
}

// each of these filters should be applied like an AND in a "where" clause
// in SQL
type ResponseFiltersType = ResponseFilter[];
```

- Design consideration - Fillout forms sometimes have things other than question answers in the responses, but you can assume for this assignment, that the ids to filter by will only ever correspond to form questions, where the values are either string, number, or strings which are ISO dates

- Responses should match the same shape as defined at [https://www.fillout.com/help/fillout-rest-api#d8b24260dddd4aaa955f85e54f4ddb4d](https://www.fillout.com/help/fillout-rest-api#d8b24260dddd4aaa955f85e54f4ddb4d) - Sjust filtering out the responses that don’t match the filters.
  - Note that this means you’ll need to make sure the pagination still works, in the response (i.e. the `totalResponses` and `pageCount` )

#### REFERENCE: Example responses and input

Example responses to a `formId`:

```ts
{
 "responses": [
  {
   "questions": [
    {
     "id": "nameId",
     "name": "What's your name?",
     "type": "ShortAnswer",
     "value": "Timmy"
    },
    {
     "id": "birthdayId",
     "name": "What is your birthday?",
     "type": "DatePicker",
     "value": "2024-02-22T05:01:47.691Z"
    },
   ],
   "submissionId": "abc",
   "submissionTime": "2024-05-16T23:20:05.324Z"
   // please include any additional keys
  },
 ],
 "totalResponses": 1,
 "pageCount": 1
}

```

Example input for filtering:

```json
[
 {
  id: "nameId",
  condition: "equals",
  value: "Timmy",
 },
 {
  id: "birthdayId",
  condition: "greater_than",
  value: "2024-02-23T05:01:47.691Z"
 }
]
```

Output:
No responses are returned, because even though `Timmy` matches the name, the birthday is not greater than the one in our filter.
