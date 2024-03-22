import { Question } from "../types";

export const handleEqualsCondition = (question: Question, filterValue: string | number): boolean => {
  // If the question value is a date, compare dates
  if (question.type === 'Date') {
    // Assuming question.value is an ISO date string when question.type is 'Date'
    const questionDate = new Date(question.value as string)
    const filterDate = new Date(filterValue);
    return questionDate?.getTime() === filterDate.getTime();
  }

  // Default to strict equality for strings and numbers
  return question.value === filterValue;
};
