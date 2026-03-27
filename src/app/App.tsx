import { useCallback, useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { ServiceStatusCard } from "./src/components/ServiceStatusCard";
import { fetchBootstrap } from "./src/services/api";
import type { BootstrapResponse } from "./src/types/bootstrap";

type LoadState =
  | { kind: "loading" }
  | { kind: "success"; data: BootstrapResponse }
  | { kind: "error"; message: string };

export default function App() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async () => {
    setState({ kind: "loading" });

    try {
      const data = await fetchBootstrap();
      setState({ kind: "success", data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown server error";
      setState({ kind: "error", message });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Local-first bookkeeping</Text>
        <Text style={styles.title}>Service status page</Text>
        <Text style={styles.description}>
          This minimal app verifies that the mobile shell can reach the Go API
          and render a stable bootstrap payload.
        </Text>

        {state.kind === "loading" ? (
          <Text accessibilityRole="text" style={styles.message}>
            Checking backend connection...
          </Text>
        ) : null}

        {state.kind === "success" ? <ServiceStatusCard data={state.data} /> : null}

        {state.kind === "error" ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Backend unavailable</Text>
            <Text style={styles.errorMessage}>{state.message}</Text>
            <Pressable accessibilityRole="button" onPress={() => void load()} style={styles.button}>
              <Text style={styles.buttonLabel}>Retry</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2ebe0",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: "#f2ebe0",
  },
  eyebrow: {
    color: "#8b5e34",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  title: {
    color: "#1e1a14",
    fontSize: 34,
    fontWeight: "800",
  },
  description: {
    color: "#4b4338",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#1e1a14",
  },
  errorBox: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#fff1ef",
    borderWidth: 1,
    borderColor: "#cc7d73",
    gap: 12,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#8f291d",
  },
  errorMessage: {
    fontSize: 16,
    color: "#5f241d",
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#8f291d",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  buttonLabel: {
    color: "#fff8f5",
    fontSize: 15,
    fontWeight: "700",
  },
});
