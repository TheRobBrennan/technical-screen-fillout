import { describe, it, expect } from 'vitest';
import { handleEqualsCondition } from './handleEqualsCondition';

describe('handleEqualsCondition', () => {
  it('returns true for matching dates', () => {
    const question = {
      id: '1',
      name: 'Start Date',
      type: 'Date',
      value: '2024-01-01'
    };
    const filterValue = '2024-01-01';
    expect(handleEqualsCondition(question, filterValue)).toBe(true);
  });

  it('returns false for non-matching dates', () => {
    const question = {
      id: '1',
      name: 'Start Date',
      type: 'Date',
      value: '2024-01-01'
    };
    const filterValue = '2024-01-02';
    expect(handleEqualsCondition(question, filterValue)).toBe(false);
  });

  it('returns true for matching string values', () => {
    const question = {
      id: '2',
      name: 'Email Address',
      type: 'Email',
      value: 'test@example.com'
    };
    const filterValue = 'test@example.com';
    expect(handleEqualsCondition(question, filterValue)).toBe(true);
  });

  it('returns false for non-matching string values', () => {
    const question = {
      id: '2',
      name: 'Email Address',
      type: 'Email',
      value: 'test@example.com'
    };
    const filterValue = 'other@example.com';
    expect(handleEqualsCondition(question, filterValue)).toBe(false);
  });

  it('returns true for matching number values', () => {
    const question = {
      id: '3',
      name: 'Age',
      type: 'Number',
      value: 30
    };
    const filterValue = 30;
    expect(handleEqualsCondition(question, filterValue)).toBe(true);
  });

  it('returns false for non-matching number values', () => {
    const question = {
      id: '3',
      name: 'Age',
      type: 'Number',
      value: 30
    };
    const filterValue = 31;
    expect(handleEqualsCondition(question, filterValue)).toBe(false);
  });
});
