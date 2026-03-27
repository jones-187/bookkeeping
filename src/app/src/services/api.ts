import { API_BASE_URL } from "../constants/api";
import type { BootstrapResponse } from "../types/bootstrap";

export async function fetchBootstrap(): Promise<BootstrapResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/bootstrap`);

  if (!response.ok) {
    throw new Error(`Server request failed with status ${response.status}`);
  }

  return (await response.json()) as BootstrapResponse;
}
