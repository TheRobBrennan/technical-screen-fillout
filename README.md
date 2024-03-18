# Welcome

An example [Express.JS](https://expressjs.com) and [TypeScript](https://www.typescriptlang.org) application ready for deployment to [Vercel](https://vercel.com/).

You can view the [DEMO](https://expressjs-vercel-starter.vercel.app) [Express.JS](https://expressjs.com) application hosted on [Vercel](https://vercel.com/) at [https://expressjs-vercel-starter.vercel.app](https://expressjs-vercel-starter.vercel.app)

## Getting started

As long as you have [Node.JS](https://nodejs.org/) installed on your development environment, you can get this project up and running by running the following:

```sh
# Check to make sure Node.js and npm is installed
% node -v
v20.11.1

% npm -v
10.2.4

# Install dependencies
% npm install
```

Once you have the project dependencies installed, you can start the application by running:

```sh
# Run the development script
% npm run dev

> expressjs-vercel-starter@0.0.0 dev
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
