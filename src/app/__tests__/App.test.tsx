/**
 * App 组件测试
 */
import { render } from "@testing-library/react-native";
import App from "../App";

// Mock navigation components
jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: () => null,
  }),
}));

jest.mock("react-native-paper", () => ({
  PaperProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ colors: { primary: "#6200ee" } }),
}));

jest.mock("react-native-screens", () => ({
  enableScreens: jest.fn(),
}));

jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock screens
jest.mock("../src/features/ledger/screens/LedgerListScreen", () => {
  const { Text } = require("react-native");
  return () => null;
});

jest.mock("../src/features/ledger/screens/AddEntryScreen", () => {
  return () => null;
});

jest.mock("../src/features/ledger/screens/EditEntryScreen", () => {
  return () => null;
});

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
  });
});
