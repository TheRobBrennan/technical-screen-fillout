import { Question } from "../../types";

export const handleGreaterThanCondition = (question: Question, filterValue: string | number): boolean => {
  // Direct comparison for dates
  if (question.type === 'Date') {
    const questionDate = new Date(question.value as string);
    const filterDate = new Date(filterValue);
    return questionDate.getTime() > filterDate.getTime();
  }

  // Attempt to parse as numbers for numeric comparison
  const questionNumber = parseFloat(question.value as string);
  const filterNumber = parseFloat(filterValue as string);
  if (!isNaN(questionNumber) && !isNaN(filterNumber)) {
    return questionNumber > filterNumber;
  }

  // Fallback to string comparison for non-numeric values
  if (typeof question.value === 'string') {
    return question.value > filterValue;
  }

  // If the comparison is not applicable, log a warning or handle accordingly
  console.warn(`Cannot compare values for greater_than condition. Question ID: ${question.id}, Type: ${question.type}`);
  return false;
};
