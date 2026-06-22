import "@testing-library/jest-dom";

// Mock IntersectionObserver for Framer Motion
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(global as any).IntersectionObserver = MockIntersectionObserver;
