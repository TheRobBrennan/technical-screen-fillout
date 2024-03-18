import { Request, Response } from 'express';
import { fetchAndSaveFormResponses } from '../services/filloutService'; // Assume you have this function implemented

// Redirect to filtered responses
export const redirectToFilteredResponses = (_: Request, res: Response) => {
  const formId = process.env.FILLOUT_FORM_ID;
  res.redirect(`/${formId}/filteredResponses`);
};

// Get filtered responses for a form
export const getFilteredResponses = async (req: Request, res: Response) => {
  const { formId } = req.params;
  try {
    const responses = await fetchAndSaveFormResponses(formId);
    res.json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching form responses.');
  }
};
