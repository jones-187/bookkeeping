package app

import "os"

const defaultPort = "8080"

type Config struct {
	Port        string
	ServiceName string
	Version     string
	Features    []string
}

func LoadConfig() Config {
	return Config{
		Port:        getEnv("PORT", defaultPort),
		ServiceName: getEnv("SERVICE_NAME", "bookkeeping-server"),
		Version:     getEnv("APP_VERSION", "dev"),
		Features: []string{
			"local-first-ready",
			"offline-ledger-planned",
			"sync-not-enabled",
		},
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
