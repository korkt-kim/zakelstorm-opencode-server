.PHONY: help dev prod up down logs clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment (OpenCode + Webhook server with hot reload)
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started!"
	@echo "   - OpenCode Server: http://localhost:4096"
	@echo "   - Webhook Server: http://localhost:8080"
	@echo ""
	@echo "View logs: make logs"

prod: ## Start production environment
	docker-compose up -d
	@echo "✅ Production environment started!"
	@echo "   - OpenCode Server: http://localhost:4096"
	@echo "   - Webhook Server: http://localhost:8080"

up: dev ## Alias for 'make dev'

down: ## Stop all containers
	docker-compose -f docker-compose.dev.yml down
	docker-compose down
	@echo "✅ All containers stopped"

logs: ## Show logs for all services
	docker-compose -f docker-compose.dev.yml logs -f

logs-webhook: ## Show logs for webhook server only
	docker-compose -f docker-compose.dev.yml logs -f webhook-server

logs-opencode: ## Show logs for OpenCode server only
	docker-compose -f docker-compose.dev.yml logs -f opencode-server

restart: ## Restart all services
	docker-compose -f docker-compose.dev.yml restart
	@echo "✅ Services restarted"

clean: down ## Stop containers and remove volumes
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v
	@echo "✅ Containers and volumes removed"

rebuild: ## Rebuild and restart all services
	docker-compose -f docker-compose.dev.yml up -d --build
	@echo "✅ Services rebuilt and restarted"

status: ## Show status of all services
	docker-compose -f docker-compose.dev.yml ps
