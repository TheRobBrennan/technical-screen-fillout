import { describe, it, expect, vi } from 'vitest';
import { handleLessThanCondition } from './handleLessThanCondition';
import { Question } from "../types";

describe('handleLessThanCondition', () => {
  // Date comparisons
  it('returns true for dates where question date is less', () => {
    const question: Question = {
      id: 'dateQuestion',
      name: 'Event Date',
      type: 'Date',
      value: '2024-01-01',
    };
    const filterValue = '2024-02-02'; // As string
    expect(handleLessThanCondition(question, filterValue)).toBe(true);
  });

  it('returns false for dates where question date is not less', () => {
    const question: Question = {
      id: 'dateQuestion',
      name: 'Event Date',
      type: 'Date',
      value: '2024-03-03',
    };
    const filterValue = new Date('2024-01-01'); // As Date object converted to string
    expect(handleLessThanCondition(question, filterValue.toString())).toBe(false);
  });

  // Numeric comparisons
  it('returns true for numeric values where question value is less', () => {
    const question: Question = {
      id: 'numberQuestion',
      name: 'Age',
      type: 'Number',
      value: '29',
    };
    const filterValue = 30; // As number
    expect(handleLessThanCondition(question, filterValue)).toBe(true);
  });

  it('returns false for numeric values where question value is not less', () => {
    const question: Question = {
      id: 'numberQuestion',
      name: 'Age',
      type: 'Number',
      value: '31',
    };
    const filterValue = '30'; // As string
    expect(handleLessThanCondition(question, filterValue)).toBe(false);
  });

  // String comparisons
  it('returns true for string comparisons where question value is lexicographically less', () => {
    const question: Question = {
      id: 'stringQuestion',
      name: 'Alphabetical Test',
      type: 'Text',
      value: 'a',
    };
    const filterValue = 'b'; // As string
    expect(handleLessThanCondition(question, filterValue)).toBe(true);
  });

  it('returns false for string comparisons where question value is lexicographically not less', () => {
    const question: Question = {
      id: 'stringQuestion',
      name: 'Alphabetical Test',
      type: 'Text',
      value: 'c',
    };
    const filterValue = 'b'; // As string
    expect(handleLessThanCondition(question, filterValue)).toBe(false);
  });

  // Unhandled comparison types
  it('logs a warning and returns false for unhandled question types or values', () => {
    const question: Question = {
      id: 'complexQuestion',
      name: 'Unhandled Type',
      type: 'Complex',
      value: null, // Simulating an unhandled type
    };
    const filterValue = 'data'; // As string
    const consoleWarnSpy = vi.spyOn(console, 'warn');
    expect(handleLessThanCondition(question, filterValue)).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });
});
