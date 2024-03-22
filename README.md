# Welcome

An example [Express.JS](https://expressjs.com) and [TypeScript](https://www.typescriptlang.org) application ready for deployment to [Vercel](https://vercel.com/).

You can view the [DEMO](https://technical-screen-fillout.vercel.app) application hosted on [Vercel](https://vercel.com/) at [https://technical-screen-fillout.vercel.app](https://technical-screen-fillout.vercel.app)

- View all responses for an example `formId` - [https://technical-screen-fillout.vercel.app/cLZojxk94ous/filteredResponses](https://technical-screen-fillout.vercel.app/cLZojxk94ous/filteredResponses)

- View filtered responses for an example `formId` - [https://technical-screen-fillout.vercel.app/cLZojxk94ous/filteredResponses?filters=%5B%7B%22id%22%3A%22kc6S6ThWu3cT5PVZkwKUg4%22%2C%22condition%22%3A%22equals%22%2C%22value%22%3A%22johnny%40fillout.com%22%7D%5D](https://technical-screen-fillout.vercel.app/cLZojxk94ous/filteredResponses?filters=%5B%7B%22id%22%3A%22kc6S6ThWu3cT5PVZkwKUg4%22%2C%22condition%22%3A%22equals%22%2C%22value%22%3A%22johnny%40fillout.com%22%7D%5D)

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

Once you have the project dependencies installed, let's run our tests.

![SCREENCAST: npm test](./screencasts/Mar-22-2024%2001-13-46-npm-test.gif)

Looks good. What tests were written?

![SCREENCAST: npm run test:verbose](./screencasts/Mar-22-2024%2001-16-34-npm-run-test-verbose.gif)

How's the code coverage look for our tests?

![SCREENCAST: npm run test:coverage](./screencasts/Mar-22-2024%2001-18-56-npm-run-test-coverage.gif)

Looks great. Let's poke around a little and see what's in our test suite:

![SCREENCAST: npm run test:coverage:open](./screencasts/Mar-22-2024%2001-27-04-npm-run-test-coverage-open.gif)

Our tests look great. Let's start the development server by running:

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

![SCREENCAST: npm run dev](./screencasts/Mar-22-2024%2001-29-23-npm-run-dev.gif)

## Folder Structure

```sh
.
├── README.md
├── api
│   └── index.ts
├── coverage
├── package-lock.json
├── package.json
├── screencasts
├── src
│   ├── controllers
│   │   └── fillout
│   │       ├── filloutController.test.ts
│   │       └── filloutController.ts
│   ├── routes
│   │   └── fillout
│   │       └── filloutRoutes.ts
│   ├── server.test.ts
│   ├── server.ts
│   ├── services
│   │   └── fillout
│   │       ├── filloutService.test.ts
│   │       ├── filloutService.ts
│   │       ├── filters
│   │       │   ├── handleDoesNotEqualCondition.test.ts
│   │       │   ├── handleDoesNotEqualCondition.ts
│   │       │   ├── handleEqualsCondition.test.ts
│   │       │   ├── handleEqualsCondition.ts
│   │       │   ├── handleGreaterThanCondition.test.ts
│   │       │   ├── handleGreaterThanCondition.ts
│   │       │   ├── handleLessThanCondition.test.ts
│   │       │   └── handleLessThanCondition.ts
│   │       ├── mocks
│   │       │   └── responses.json
│   │       ├── tmp
│   │       └── types.ts
│   └── utils
│       ├── pathUtils.test.ts
│       └── pathUtils.ts
├── tsconfig.json
├── vercel.json
└── vitest.config.mts
```
