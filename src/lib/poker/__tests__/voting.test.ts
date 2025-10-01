import { canVoteOnStory, isValidVoteValue } from '../utils';
import { ESTIMATION_SEQUENCES } from '../utils';

describe('Voting Utilities', () => {
  describe('canVoteOnStory', () => {
    it('should allow voting when story status is "voting"', () => {
      expect(canVoteOnStory('voting')).toBe(true);
    });

    it('should not allow voting when story status is "pending"', () => {
      expect(canVoteOnStory('pending')).toBe(false);
    });

    it('should not allow voting when story status is "revealed"', () => {
      expect(canVoteOnStory('revealed')).toBe(false);
    });

    it('should not allow voting when story status is "estimated"', () => {
      expect(canVoteOnStory('estimated')).toBe(false);
    });

    it('should not allow voting when story status is "skipped"', () => {
      expect(canVoteOnStory('skipped')).toBe(false);
    });
  });

  describe('isValidVoteValue', () => {
    describe('Fibonacci sequence', () => {
      const sequence = ESTIMATION_SEQUENCES.fibonacci;

      it('should validate numeric Fibonacci values', () => {
        expect(isValidVoteValue('0', sequence)).toBe(true);
        expect(isValidVoteValue('1', sequence)).toBe(true);
        expect(isValidVoteValue('2', sequence)).toBe(true);
        expect(isValidVoteValue('3', sequence)).toBe(true);
        expect(isValidVoteValue('5', sequence)).toBe(true);
        expect(isValidVoteValue('8', sequence)).toBe(true);
        expect(isValidVoteValue('13', sequence)).toBe(true);
        expect(isValidVoteValue('21', sequence)).toBe(true);
      });

      it('should validate special values', () => {
        expect(isValidVoteValue('?', sequence)).toBe(true);
        expect(isValidVoteValue('☕', sequence)).toBe(true);
      });

      it('should reject invalid values', () => {
        expect(isValidVoteValue('4', sequence)).toBe(false);
        expect(isValidVoteValue('100', sequence)).toBe(false);
        expect(isValidVoteValue('invalid', sequence)).toBe(false);
      });
    });

    describe('T-shirt sequence', () => {
      const sequence = ESTIMATION_SEQUENCES.tshirt;

      it('should validate T-shirt sizes', () => {
        expect(isValidVoteValue('XS', sequence)).toBe(true);
        expect(isValidVoteValue('S', sequence)).toBe(true);
        expect(isValidVoteValue('M', sequence)).toBe(true);
        expect(isValidVoteValue('L', sequence)).toBe(true);
        expect(isValidVoteValue('XL', sequence)).toBe(true);
        expect(isValidVoteValue('XXL', sequence)).toBe(true);
      });

      it('should validate special values', () => {
        expect(isValidVoteValue('?', sequence)).toBe(true);
      });

      it('should reject invalid values', () => {
        expect(isValidVoteValue('XXXL', sequence)).toBe(false);
        expect(isValidVoteValue('1', sequence)).toBe(false);
        expect(isValidVoteValue('☕', sequence)).toBe(false); // Not in T-shirt special values
      });
    });

    describe('Linear sequence', () => {
      const sequence = ESTIMATION_SEQUENCES.linear;

      it('should validate linear values 1-10', () => {
        for (let i = 1; i <= 10; i++) {
          expect(isValidVoteValue(String(i), sequence)).toBe(true);
        }
      });

      it('should validate special values', () => {
        expect(isValidVoteValue('?', sequence)).toBe(true);
        expect(isValidVoteValue('☕', sequence)).toBe(true);
      });

      it('should reject invalid values', () => {
        expect(isValidVoteValue('0', sequence)).toBe(false);
        expect(isValidVoteValue('11', sequence)).toBe(false);
      });
    });

    describe('Powers of 2 sequence', () => {
      const sequence = ESTIMATION_SEQUENCES['powers-of-2'];

      it('should validate power of 2 values', () => {
        expect(isValidVoteValue('1', sequence)).toBe(true);
        expect(isValidVoteValue('2', sequence)).toBe(true);
        expect(isValidVoteValue('4', sequence)).toBe(true);
        expect(isValidVoteValue('8', sequence)).toBe(true);
        expect(isValidVoteValue('16', sequence)).toBe(true);
        expect(isValidVoteValue('32', sequence)).toBe(true);
        expect(isValidVoteValue('64', sequence)).toBe(true);
      });

      it('should validate special values', () => {
        expect(isValidVoteValue('?', sequence)).toBe(true);
        expect(isValidVoteValue('☕', sequence)).toBe(true);
      });

      it('should reject invalid values', () => {
        expect(isValidVoteValue('3', sequence)).toBe(false);
        expect(isValidVoteValue('128', sequence)).toBe(false);
      });
    });
  });
});
