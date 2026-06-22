import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home page", () => {
  it("renders the hero heading", () => {
    render(<Home />);
    expect(screen.getByText(/Charge smarter/i)).toBeInTheDocument();
  });

  it("renders the CTA buttons", () => {
    render(<Home />);
    expect(screen.getByText(/Try the Map/i)).toBeInTheDocument();
    expect(screen.getByText(/View Dashboard/i)).toBeInTheDocument();
  });

  it("renders feature cards", () => {
    render(<Home />);
    expect(screen.getByText(/Find Chargers/i)).toBeInTheDocument();
    expect(screen.getByText(/Plan Routes/i)).toBeInTheDocument();
    expect(screen.getByText(/Track Carbon/i)).toBeInTheDocument();
    expect(screen.getByText(/Safety First/i)).toBeInTheDocument();
  });

  it("renders pricing section", () => {
    render(<Home />);
    expect(screen.getByText(/Unlock Boost/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Free/i).length).toBeGreaterThan(0);
  });
});
