package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"bookkeeping/src/server/internal/app"
)

func TestHealthz(t *testing.T) {
	router := NewRouter(app.LoadConfig())
	request := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var response map[string]string
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("expected valid JSON response: %v", err)
	}

	if response["status"] != "ok" {
		t.Fatalf("expected health status ok, got %q", response["status"])
	}
}

func TestBootstrap(t *testing.T) {
	router := NewRouter(app.LoadConfig())
	request := httptest.NewRequest(http.MethodGet, "/api/v1/bootstrap", nil)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var response struct {
		Status      string   `json:"status"`
		ServiceName string   `json:"serviceName"`
		Version     string   `json:"version"`
		ServerTime  string   `json:"serverTime"`
		Features    []string `json:"features"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("expected valid JSON response: %v", err)
	}

	if response.Status != "ok" {
		t.Fatalf("expected status ok, got %q", response.Status)
	}
	if response.ServiceName != "bookkeeping-server" {
		t.Fatalf("expected service name bookkeeping-server, got %q", response.ServiceName)
	}
	if response.Version != "dev" {
		t.Fatalf("expected version dev, got %q", response.Version)
	}
	if len(response.Features) == 0 {
		t.Fatal("expected features to be non-empty")
	}
	if _, err := time.Parse(time.RFC3339, response.ServerTime); err != nil {
		t.Fatalf("expected RFC3339 serverTime, got error: %v", err)
	}
}
