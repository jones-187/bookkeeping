package http

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"bookkeeping/src/server/internal/app"
	"bookkeeping/src/server/internal/http/handler"
)

func NewRouter(config app.Config) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())
	router.Use(cors.Default())

	handler.New(config).RegisterRoutes(router)

	return router
}
