import path from 'path';

// Compute and export the base path for file storage
export const basePath = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, '../services/tmp');
