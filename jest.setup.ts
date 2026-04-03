/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';

// Mock ResizeObserver for React Flow and UI components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;
global.ResizeObserver = ResizeObserverMock;

// Mock PointerEvent for Radix UI and standard web interactions
if (typeof window !== 'undefined') {
  class PointerEventMock extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;
    
    constructor(type: string, props: PointerEventInit = {}) {
      super(type, props);
      this.button = props.button || 0;
      this.ctrlKey = props.ctrlKey || false;
      this.pointerType = props.pointerType || 'mouse';
    }
  }
  (window as any).PointerEvent = PointerEventMock;
}
