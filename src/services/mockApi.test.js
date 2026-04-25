import { describe, it, expect } from 'vitest';
import { validateTransition } from './mockApi';

describe('KYC State Machine', () => {
  it('should allow valid transition from draft to under_review', () => {
    expect(validateTransition('draft', 'under_review')).toBe(true);
  });

  it('should throw error for illegal transition from draft to approved', () => {
    // Approved can only be reached from under_review
    expect(() => validateTransition('draft', 'approved')).toThrow('Illegal State Transition');
  });

  it('should throw error for illegal transition from rejected to approved', () => {
    // Must go back to under_review first
    expect(() => validateTransition('rejected', 'approved')).toThrow('Illegal State Transition');
  });

  it('should allow transition from under_review to rejected', () => {
    expect(validateTransition('under_review', 'rejected')).toBe(true);
  });
});
