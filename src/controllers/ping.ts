import { Request, Response } from 'express';

export default async (_: Request, res: Response) => {
  // try {
  res.status(200).json({ pong: "Hello, World!", timestamp: new Date().toISOString() });
  // } catch (error) {
  //   const msg = `Internal server error: ${error}`;
  //   res.status(500).json({ error: msg, success: false });
  // }
};
