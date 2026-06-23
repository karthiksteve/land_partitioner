import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/search",
}));

// Mock zustand auth store
jest.mock("@/store/authStore", () => ({
  useAuthStore: () => ({
    user: { full_name: "Test User", email: "test@example.com", username: "testuser" },
    isAuthenticated: true,
    logout: jest.fn(),
  }),
}));

// Mock react-query
jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
  useMutation: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useQueryClient: () => ({
    setQueryData: jest.fn(),
  }),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ParcelSearchForm component
jest.mock("@/components/forms/ParcelSearchForm", () => {
  return function MockParcelSearchForm({
    onSearch,
    isLoading,
  }: {
    onSearch: (data: { district: string; circle?: string; mouza?: string; plot_number?: string }) => void;
    isLoading?: boolean;
  }) {
    return (
      <div data-testid="parcel-search-form">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch({
              district: "Patna",
              plot_number: "123",
            });
          }}
        >
          <input
            data-testid="district-input"
            placeholder="District"
            defaultValue="Patna"
          />
          <input
            data-testid="plot-input"
            placeholder="Plot Number"
            defaultValue="123"
          />
          <button type="submit" data-testid="search-button">
            {isLoading ? "Searching..." : "Search Parcel"}
          </button>
        </form>
      </div>
    );
  };
});

describe("ParcelSearch - Search Functionality", () => {
  it("renders the search page with form", () => {
    const SearchPage = require("@/app/(dashboard)/search/page").default;
    render(<SearchPage />);

    expect(screen.getByText("Parcel Search")).toBeInTheDocument();
    expect(screen.getByTestId("parcel-search-form")).toBeInTheDocument();
  });

  it("renders search form with district and plot inputs", () => {
    const SearchPage = require("@/app/(dashboard)/search/page").default;
    render(<SearchPage />);

    expect(screen.getByTestId("district-input")).toBeInTheDocument();
    expect(screen.getByTestId("plot-input")).toBeInTheDocument();
    expect(screen.getByTestId("search-button")).toBeInTheDocument();
  });

  it("shows search prompt when no results exist", () => {
    const SearchPage = require("@/app/(dashboard)/search/page").default;
    render(<SearchPage />);

    expect(
      screen.getByText("Search for a Land Parcel")
    ).toBeInTheDocument();
  });

  it("triggers search on form submission", async () => {
    const mockOnSearch = jest.fn();
    const ParcelSearchForm = require("@/components/forms/ParcelSearchForm").default;

    render(
      <ParcelSearchForm
        onSearch={mockOnSearch}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByTestId("search-button"));

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        district: "Patna",
        plot_number: "123",
      });
    });
  });
});
