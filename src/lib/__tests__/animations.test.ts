/**
 * Tests for animation utilities
 * Validates all animation variants and their configurations
 */

import {
  fadeInUp,
  fadeIn,
  staggerContainer,
  letterAnimation,
  scaleIn,
  slideInLeft,
  slideInRight,
  floatAnimation,
  glowAnimation,
  gradientAnimation,
} from '@/lib/animations';

describe('Animation Utilities', () => {
  describe('fadeInUp', () => {
    it('should have correct initial state', () => {
      expect(fadeInUp.initial).toEqual({
        opacity: 0,
        y: 20,
      });
    });

    it('should have correct animate state', () => {
      expect(fadeInUp.animate).toEqual({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      });
    });

    it('should be a complete Variants object', () => {
      expect(fadeInUp).toHaveProperty('initial');
      expect(fadeInUp).toHaveProperty('animate');
    });
  });

  describe('fadeIn', () => {
    it('should have correct initial state', () => {
      expect(fadeIn.initial).toEqual({
        opacity: 0,
      });
    });

    it('should have correct animate state', () => {
      expect(fadeIn.animate).toEqual({
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      });
    });

    it('should only animate opacity', () => {
      expect(fadeIn.initial).not.toHaveProperty('x');
      expect(fadeIn.initial).not.toHaveProperty('y');
      expect(fadeIn.initial).not.toHaveProperty('scale');
    });
  });

  describe('staggerContainer', () => {
    it('should have empty initial state', () => {
      expect(staggerContainer.initial).toEqual({});
    });

    it('should have correct stagger configuration', () => {
      expect(staggerContainer.animate).toEqual({
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      });
    });

    it('should have stagger timing properties', () => {
      const transition = staggerContainer.animate.transition;
      expect(transition.staggerChildren).toBe(0.1);
      expect(transition.delayChildren).toBe(0.2);
    });
  });

  describe('letterAnimation', () => {
    it('should have correct initial state for 3D rotation', () => {
      expect(letterAnimation.initial).toEqual({
        opacity: 0,
        y: 50,
        rotateX: -90,
      });
    });

    it('should animate to neutral position', () => {
      expect(letterAnimation.animate).toEqual({
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      });
    });

    it('should include 3D rotation properties', () => {
      expect(letterAnimation.initial).toHaveProperty('rotateX');
      expect(letterAnimation.animate).toHaveProperty('rotateX');
    });
  });

  describe('scaleIn', () => {
    it('should have correct initial scale and opacity', () => {
      expect(scaleIn.initial).toEqual({
        opacity: 0,
        scale: 0.8,
      });
    });

    it('should scale to normal size', () => {
      expect(scaleIn.animate).toEqual({
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      });
    });

    it('should use consistent transition timing', () => {
      const transition = scaleIn.animate.transition;
      expect(transition.duration).toBe(0.5);
      expect(transition.ease).toBe("easeOut");
    });
  });

  describe('slideInLeft', () => {
    it('should start from left position', () => {
      expect(slideInLeft.initial).toEqual({
        opacity: 0,
        x: -100,
      });
    });

    it('should slide to center', () => {
      expect(slideInLeft.animate).toEqual({
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      });
    });

    it('should use negative x for left slide', () => {
      expect(slideInLeft.initial.x).toBeLessThan(0);
    });
  });

  describe('slideInRight', () => {
    it('should start from right position', () => {
      expect(slideInRight.initial).toEqual({
        opacity: 0,
        x: 100,
      });
    });

    it('should slide to center', () => {
      expect(slideInRight.animate).toEqual({
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      });
    });

    it('should use positive x for right slide', () => {
      expect(slideInRight.initial.x).toBeGreaterThan(0);
    });

    it('should be opposite of slideInLeft', () => {
      expect(slideInRight.initial.x).toBe(-slideInLeft.initial.x);
    });
  });

  describe('floatAnimation', () => {
    it('should have correct animation configuration', () => {
      expect(floatAnimation.animate).toEqual({
        y: [0, -20, 0],
        transition: {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });
    });

    it('should create floating motion', () => {
      const yValues = floatAnimation.animate.y;
      expect(Array.isArray(yValues)).toBe(true);
      expect(yValues[0]).toBe(0);
      expect(yValues[1]).toBeLessThan(0);
      expect(yValues[2]).toBe(0);
    });

    it('should repeat infinitely', () => {
      expect(floatAnimation.animate.transition.repeat).toBe(Infinity);
    });

    it('should have long duration for slow float', () => {
      expect(floatAnimation.animate.transition.duration).toBe(6);
    });
  });

  describe('glowAnimation', () => {
    it('should animate box shadow', () => {
      const boxShadow = glowAnimation.animate.boxShadow;
      expect(Array.isArray(boxShadow)).toBe(true);
      expect(boxShadow).toHaveLength(3);
    });

    it('should use purple glow colors', () => {
      const boxShadow = glowAnimation.animate.boxShadow;
      boxShadow.forEach((shadow: string) => {
        expect(shadow).toContain('139, 92, 246');
      });
    });

    it('should have different opacity values', () => {
      const boxShadow = glowAnimation.animate.boxShadow;
      expect(boxShadow[0]).toContain('0.3');
      expect(boxShadow[1]).toContain('0.5');
      expect(boxShadow[2]).toContain('0.3');
    });

    it('should have medium duration and infinite repeat', () => {
      const transition = glowAnimation.animate.transition;
      expect(transition.duration).toBe(2);
      expect(transition.repeat).toBe(Infinity);
      expect(transition.ease).toBe("easeInOut");
    });
  });

  describe('gradientAnimation', () => {
    it('should animate background position', () => {
      const backgroundPosition = gradientAnimation.animate.backgroundPosition;
      expect(Array.isArray(backgroundPosition)).toBe(true);
      expect(backgroundPosition).toEqual(["0% 50%", "100% 50%", "0% 50%"]);
    });

    it('should create seamless loop', () => {
      const positions = gradientAnimation.animate.backgroundPosition;
      expect(positions[0]).toBe(positions[2]);
    });

    it('should use linear timing', () => {
      const transition = gradientAnimation.animate.transition;
      expect(transition.duration).toBe(5);
      expect(transition.repeat).toBe(Infinity);
      expect(transition.ease).toBe("linear");
    });

    it('should move from left to right and back', () => {
      const positions = gradientAnimation.animate.backgroundPosition;
      expect(positions[0]).toBe("0% 50%");
      expect(positions[1]).toBe("100% 50%");
      expect(positions[2]).toBe("0% 50%");
    });
  });

  describe('Animation Consistency', () => {
    it('should use consistent duration for basic animations', () => {
      const basicAnimations = [fadeInUp, fadeIn, letterAnimation, scaleIn, slideInLeft, slideInRight];
      basicAnimations.forEach(animation => {
        expect(animation.animate.transition.duration).toBe(0.5);
      });
    });

    it('should use consistent ease for basic animations', () => {
      const basicAnimations = [fadeInUp, fadeIn, letterAnimation, scaleIn, slideInLeft, slideInRight];
      basicAnimations.forEach(animation => {
        expect(animation.animate.transition.ease).toBe("easeOut");
      });
    });

    it('should use infinite repeat for continuous animations', () => {
      const continuousAnimations = [floatAnimation, glowAnimation, gradientAnimation];
      continuousAnimations.forEach(animation => {
        expect(animation.animate.transition.repeat).toBe(Infinity);
      });
    });
  });

  describe('Animation Properties', () => {
    it('should have opacity changes in fade animations', () => {
      const fadeAnimations = [fadeInUp, fadeIn, letterAnimation, scaleIn, slideInLeft, slideInRight];
      fadeAnimations.forEach(animation => {
        expect(animation.initial.opacity).toBe(0);
        expect(animation.animate.opacity).toBe(1);
      });
    });

    it('should not have conflicting properties', () => {
      // slideInLeft and slideInRight should not have y movement
      expect(slideInLeft.initial).not.toHaveProperty('y');
      expect(slideInRight.initial).not.toHaveProperty('y');

      // scaleIn should not have positional movement
      expect(scaleIn.initial).not.toHaveProperty('x');
      expect(scaleIn.initial).not.toHaveProperty('y');
    });
  });

  describe('Type Safety', () => {
    it('should export objects with correct structure', () => {
      const staticAnimations = [fadeInUp, fadeIn, staggerContainer, letterAnimation, scaleIn, slideInLeft, slideInRight];
      staticAnimations.forEach(animation => {
        expect(typeof animation).toBe('object');
        expect(animation).not.toBeNull();
      });
    });

    it('should have proper transition objects', () => {
      const animationsWithTransitions = [fadeInUp, fadeIn, letterAnimation, scaleIn, slideInLeft, slideInRight];
      animationsWithTransitions.forEach(animation => {
        expect(typeof animation.animate.transition).toBe('object');
        expect(animation.animate.transition).not.toBeNull();
      });
    });

    it('should have numeric values for timing properties', () => {
      expect(typeof fadeInUp.animate.transition.duration).toBe('number');
      expect(typeof staggerContainer.animate.transition.staggerChildren).toBe('number');
      expect(typeof floatAnimation.animate.transition.duration).toBe('number');
    });
  });
});