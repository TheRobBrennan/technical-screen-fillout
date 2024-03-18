import { Router } from 'express';
import { redirectToFilteredResponses, getFilteredResponses } from '../controllers/filloutController';

const router = Router();

// Route to redirect to filtered responses
router.get('/', redirectToFilteredResponses);

// Route to get filtered responses for a form
router.get('/:formId/filteredResponses', getFilteredResponses);

export default router;
