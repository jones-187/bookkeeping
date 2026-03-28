import { resolveApiBaseUrl } from "../src/constants/api";

describe("resolveApiBaseUrl", () => {
  it("defaults Android to the emulator host loopback", () => {
    expect(resolveApiBaseUrl("android", undefined)).toBe(
      "http://10.0.2.2:8080",
    );
  });

  it("defaults non-Android platforms to localhost", () => {
    expect(resolveApiBaseUrl("ios", undefined)).toBe("http://localhost:8080");
    expect(resolveApiBaseUrl("web", undefined)).toBe("http://localhost:8080");
  });

  it("prefers the explicit environment override", () => {
    expect(resolveApiBaseUrl("android", " http://192.168.1.20:8080 ")).toBe(
      "http://192.168.1.20:8080",
    );
  });
});
