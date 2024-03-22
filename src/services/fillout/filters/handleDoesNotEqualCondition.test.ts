import { describe, it, expect } from 'vitest';
import { handleDoesNotEqualCondition } from './handleDoesNotEqualCondition';
import { Question } from "../types";

describe('handleDoesNotEqualCondition', () => {
  it('returns false for matching dates', () => {
    const question: Question = {
      id: '1',
      name: 'Event Date',
      type: 'Date',
      value: '2024-01-01'
    };
    const filterValue = '2024-01-01';
    expect(handleDoesNotEqualCondition(question, filterValue)).toBe(false);
  });

  it('returns true for non-matching dates', () => {
    const question: Question = {
      id: '1',
      name: 'Event Date',
      type: 'Date',
      value: '2024-01-01'
    };
    const filterValue = '2024-02-01';
    expect(handleDoesNotEqualCondition(question, filterValue)).toBe(true);
  });

  it('returns false for matching string values', () => {
    const question: Question = {
      id: '2',
      name: 'Email Address',
      type: 'Email',
      value: 'test@example.com'
    };
    const filterValue = 'test@example.com';
    expect(handleDoesNotEqualCondition(question, filterValue)).toBe(false);
  });

  it('returns true for non-matching string values', () => {
    const question: Question = {
      id: '2',
      name: 'Email Address',
      type: 'Email',
      value: 'test@example.com'
    };
    const filterValue = 'another@example.com';
    expect(handleDoesNotEqualCondition(question, filterValue)).toBe(true);
  });

  it('returns false for matching number values', () => {
    const question: Question = {
      id: '3',
      name: 'Age',
      type: 'Number',
      value: 30
    };
    const filterValue = 30; // Direct number comparison
    expect(handleDoesNotEqualCondition(question, filterValue)).toBe(false);
  });

  it('returns true for non-matching number values', () => {
    const question: Question = {
      id: '3',
      name: 'Age',
      type: 'Number',
      value: 30
    };
    const filterValue = 31; // Direct number comparison
    expect(handleDoesNotEqualCondition(question, filterValue)).toBe(true);
  });
});
