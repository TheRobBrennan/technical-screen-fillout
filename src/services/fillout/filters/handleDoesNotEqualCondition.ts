import { Question } from "../../types";

export const handleDoesNotEqualCondition = (question: Question, filterValue: string | number): boolean => {
  // If the question value is a date, compare dates
  if (question.type === 'Date') {
    const questionDate = new Date(question.value as string);
    const filterDate = new Date(filterValue);
    return questionDate.getTime() !== filterDate.getTime();
  }

  // Default to strict inequality for strings and numbers
  return question.value !== filterValue;
};
