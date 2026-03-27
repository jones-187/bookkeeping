import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import App from "../App";
import { fetchBootstrap } from "../src/services/api";

jest.mock("../src/services/api", () => ({
  fetchBootstrap: jest.fn(),
}));

const mockedFetchBootstrap = jest.mocked(fetchBootstrap);

describe("App", () => {
  beforeEach(() => {
    mockedFetchBootstrap.mockReset();
  });

  it("renders bootstrap payload on success", async () => {
    mockedFetchBootstrap.mockResolvedValue({
      status: "ok",
      serviceName: "bookkeeping-server",
      version: "dev",
      serverTime: "2026-03-27T12:34:56Z",
      features: ["local-first-ready", "offline-ledger-planned"],
    });

    render(<App />);

    expect(screen.getByText("Checking backend connection...")).toBeTruthy();

    await waitFor(() =>
      expect(screen.getByText("bookkeeping-server")).toBeTruthy(),
    );

    expect(screen.getByText(/offline-ledger-planned/)).toBeTruthy();
  });

  it("renders error state and retries", async () => {
    mockedFetchBootstrap
      .mockRejectedValueOnce(new Error("connection refused"))
      .mockResolvedValueOnce({
        status: "ok",
        serviceName: "bookkeeping-server",
        version: "dev",
        serverTime: "2026-03-27T12:34:56Z",
        features: ["sync-not-enabled"],
      });

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("Backend unavailable")).toBeTruthy(),
    );

    fireEvent.press(screen.getByText("Retry"));

    await waitFor(() =>
      expect(screen.getByText("bookkeeping-server")).toBeTruthy(),
    );
  });
});
