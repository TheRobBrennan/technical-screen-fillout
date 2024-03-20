import { Request, Response } from 'express';
import { fetchFormResponses, saveFormResponsesToFile } from '../services/filloutService'; // Assume you have this function implemented

// Redirect to filtered responses
export const redirectToFilteredResponses = (_: Request, res: Response) => {
  const formId = process.env.FILLOUT_FORM_ID;
  res.redirect(`/${formId}/filteredResponses`);
};

// Get filtered responses for a form
export const getFilteredResponses = async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;

  // Build the filters from the query parameters
  let filters = [];
  if (req.query?.filters) {
    try {
      filters = JSON.parse(req.query.filters as string);
      // FUTURE: Validate parsed filters
    } catch (error) {
      console.error(error);
      res.status(400).send('Invalid filters format.');
    }
  }

  try {
    const responses = await fetchFormResponses(formId);

    // DEBUG
    if (filters.length > 0) {
      console.log(`TODO: Apply filters to responses: ${JSON.stringify(filters, null, 2)}`);
    }

    await saveFormResponsesToFile(formId, responses);
    res.json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching form responses.');
  }
}
