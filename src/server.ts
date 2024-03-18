import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Route handlers
// import Ping from './routes/ping';
import filloutRoutes from './routes/filloutRoutes'; // Import the new route

// Express server
const server = express();
const PORT = process.env.PORT;

// Logging, CORS, and other middleware
server.use(morgan('dev'));
server.use(cors({
  origin: '*', // Or specify your allowed origins
  credentials: true, // This will enable the Access-Control-Allow-Credentials header
}));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

// FUTURE: Serve static files and other assets if necessary
// server.use(express.static(path.join(__dirname, '../public')));

// Routes
server.use('/', filloutRoutes); // Per requirements - NO prefix for the route

// Start the server
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

export default server;
