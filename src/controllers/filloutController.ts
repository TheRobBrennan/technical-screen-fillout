import { Request, Response } from 'express';
import { applyFiltersToResponses, fetchFormResponses, saveFormResponsesToFile } from '../services/filloutService'; // Assume you have this function implemented

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
    // TODO: Make sure the pagination still works in the response (i.e. the totalResponses and pageCount)
    const responses = await fetchFormResponses(formId);

    // DEBUG
    if (filters.length > 0) {
      console.log(`Apply filters to responses: ${JSON.stringify(filters, null, 2)}`);
    }

    // Apply filters to the responses if any filters are present
    const filteredResponses = applyFiltersToResponses(responses.responses, filters);

    // Save the filtered responses to a file
    await saveFormResponsesToFile(formId, { responses: filteredResponses, totalResponses: filteredResponses.length, pageCount: 1 });

    res.json(filteredResponses);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching form responses.');
  }
}
