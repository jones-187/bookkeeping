package main

import (
	"log"

	"bookkeeping/src/server/internal/app"
	serverhttp "bookkeeping/src/server/internal/http"
)

func main() {
	config := app.LoadConfig()
	router := serverhttp.NewRouter(config)

	log.Printf("starting %s on :%s", config.ServiceName, config.Port)
	if err := router.Run(":" + config.Port); err != nil {
		log.Fatal(err)
	}
}
