import { Platform } from "react-native";

const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:8080";
const DEFAULT_ANDROID_API_BASE_URL = "http://10.0.2.2:8080";

export function resolveApiBaseUrl(
  platform: string = Platform.OS,
  envValue: string | undefined = process.env.EXPO_PUBLIC_API_BASE_URL,
): string {
  const trimmedValue = envValue?.trim();

  if (trimmedValue) {
    return trimmedValue;
  }

  return platform === "android"
    ? DEFAULT_ANDROID_API_BASE_URL
    : DEFAULT_LOCAL_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();
