import { StyleSheet, Text, View } from "react-native";

import type { BootstrapResponse } from "../types/bootstrap";

type Props = {
  data: BootstrapResponse;
};

export function ServiceStatusCard({ data }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Backend status</Text>
      <Text style={styles.value}>{data.status}</Text>

      <Text style={styles.label}>Service name</Text>
      <Text style={styles.value}>{data.serviceName}</Text>

      <Text style={styles.label}>Version</Text>
      <Text style={styles.value}>{data.version}</Text>

      <Text style={styles.label}>Server time</Text>
      <Text style={styles.value}>{data.serverTime}</Text>

      <Text style={styles.label}>Features</Text>
      {data.features.map((feature) => (
        <Text key={feature} style={styles.feature}>
          • {feature}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#fff9ef",
    borderWidth: 1,
    borderColor: "#d4c4a8",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7a5c2e",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: "#1e1a14",
  },
  feature: {
    fontSize: 15,
    color: "#1e1a14",
    marginTop: 4,
  },
});
