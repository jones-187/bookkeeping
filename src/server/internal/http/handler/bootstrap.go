package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"bookkeeping/src/server/internal/app"
)

type BootstrapResponse struct {
	Status      string   `json:"status"`
	ServiceName string   `json:"serviceName"`
	Version     string   `json:"version"`
	ServerTime  string   `json:"serverTime"`
	Features    []string `json:"features"`
}

type HealthResponse struct {
	Status string `json:"status"`
}

type Handler struct {
	config app.Config
	now    func() time.Time
}

func New(config app.Config) Handler {
	return Handler{
		config: config,
		now:    time.Now().UTC,
	}
}

func (h Handler) RegisterRoutes(router gin.IRouter) {
	router.GET("/healthz", h.Health)
	router.GET("/api/v1/bootstrap", h.Bootstrap)
}

func (h Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status: "ok",
	})
}

func (h Handler) Bootstrap(c *gin.Context) {
	c.JSON(http.StatusOK, BootstrapResponse{
		Status:      "ok",
		ServiceName: h.config.ServiceName,
		Version:     h.config.Version,
		ServerTime:  h.now().Format(time.RFC3339),
		Features:    h.config.Features,
	})
}
