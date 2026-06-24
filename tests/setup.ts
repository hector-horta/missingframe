import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Automatically clean up rendering between test runs
afterEach(() => {
  cleanup();
});

declare const require: any;

// Mock framer-motion to render children synchronously without animation delays
vi.mock('framer-motion', () => {
  const React = require('react');
  const mockComponent = (tag: string) => {
    return React.forwardRef(({ children, ...props }: any, ref: any) => {
      // Omit framer-motion specific props that standard HTML elements don't accept
      const { 
        initial, animate, exit, transition, variants, 
        whileHover, whileTap, drag, onAnimationStart, 
        onAnimationComplete, ...htmlProps 
      } = props;
      return React.createElement(tag, { ...htmlProps, ref }, children);
    });
  };

  return {
    motion: {
      div: mockComponent('div'),
      form: mockComponent('form'),
      span: mockComponent('span'),
      button: mockComponent('button'),
    },
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

