import { render, screen, fireEvent } from "@testing-library/react";
import Home from "./page";

// Mock framer-motion to simplify testing
jest.mock("framer-motion", () => {
  const React = require("react");
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: React.forwardRef((props: any, ref: any) => {
        const {
          initial,
          animate,
          variants,
          whileHover,
          whileInView,
          whileTap,
          layoutId,
          ...rest
        } = props;
        return <div ref={ref} {...rest} />;
      }),
      h1: React.forwardRef((props: any, ref: any) => {
        const { initial, animate, variants, ...rest } = props;
        return <h1 ref={ref} {...rest} />;
      }),
      p: React.forwardRef((props: any, ref: any) => {
        const { initial, animate, variants, ...rest } = props;
        return <p ref={ref} {...rest} />;
      }),
      span: React.forwardRef((props: any, ref: any) => {
        const { initial, animate, variants, whileInView, ...rest } = props;
        return <span ref={ref} {...rest} />;
      }),
    },
  };
});

// Avoid 'Element is not defined' or 'getBoundingClientRect' errors
beforeAll(() => {
  Element.prototype.getBoundingClientRect = jest.fn(() => {
    return {
      width: 300,
      height: 400,
      top: 0,
      left: 0,
      bottom: 400,
      right: 300,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect;
  });
});

describe("Home Page", () => {
  it("renders the main heading and CTA", () => {
    render(<Home />);
    
    expect(screen.getByText(/Enterprise Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Onboarding in 30s/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Try It Now/i })).toBeInTheDocument();
  });

  it("handles mouse events on FeatureCards", () => {
    const { container } = render(<Home />);
    
    // Feature cards have the "group" class in our implementation
    const featureCards = container.querySelectorAll('.group');
    expect(featureCards.length).toBeGreaterThan(0);
    const featureCard = featureCards[0];

    // Trigger mouse move (with mocked getBoundingClientRect)
    fireEvent.mouseMove(featureCard, { clientX: 150, clientY: 200 });

    // Trigger mouse leave
    fireEvent.mouseLeave(featureCard);

    // Now mock gettingBoundingClientRect returning null to hit that branch
    Element.prototype.getBoundingClientRect = jest.fn(() => null as any);
    fireEvent.mouseMove(featureCard, { clientX: 150, clientY: 200 });
  });
});
