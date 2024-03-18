import express from 'express';
import Ping from '../controllers/ping';

const router = express.Router();
router.get('/', Ping);

export default router;
