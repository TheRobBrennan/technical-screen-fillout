// Defined per the project requirements at https://fillout.notion.site/Software-engineering-assignment-fbd58fd78f59495c99866b91b1358221
export type FilterClauseType = {
  id: string;
  condition: unknown | 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
  value: number | string;
};

export type ConditionCheck = (questionValue: string, filterValue: string) => boolean;

// Define a type for the question types
export type QuestionType = 'LongAnswer' | 'ShortAnswer' | 'DatePicker' | 'NumberInput' | 'MultipleChoice' | 'EmailInput' | string;
export const supportedQuestionTypes: QuestionType[] = ['LongAnswer', 'ShortAnswer', 'DatePicker', 'NumberInput', 'MultipleChoice', 'EmailInput'];

// Define a type for a single question
export type Question = {
  id: string;
  name: string;
  type: QuestionType;
  value: string | number | null;
};

// Define a type for a single form submission response
export type SubmissionResponse = {
  submissionId: string;
  submissionTime: string;
  lastUpdatedAt: string;
  questions: Question[];

  // FUTURE: Adjust the 'any' type as needed based on the actual structure of the response once these need to be used
  calculations: any[];
  urlParameters: any[];
  quiz: any;
  documents: any[];
};

// Define the type for the API response containing all form responses
export type FormResponses = {
  responses: SubmissionResponse[];
  totalResponses: number;
  pageCount: number;
};
