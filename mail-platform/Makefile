.PHONY: help setup build up down restart logs status backup restore test-backend test-frontend dkim-gen

SHELL := /bin/bash
COMPOSE := docker compose

help:
	@echo "Production Personal Email Platform Management"
	@echo "============================================="
	@echo "  make setup         - Initialize environment and directories"
	@echo "  make build         - Build container images"
	@echo "  make up            - Start all platform containers"
	@echo "  make down          - Stop and remove containers"
	@echo "  make restart       - Restart container services"
	@echo "  make logs          - View aggregated service logs"
	@echo "  make status        - Display container status and health"
	@echo "  make dkim-gen      - Generate DKIM keys for ivanaffriandi.com"
	@echo "  make backup        - Run automated encrypted 3-2-1 backup script"
	@echo "  make restore       - Run backup restoration script"
	@echo "  make test-backend  - Run FastAPI unit and integration tests"
	@echo "  make test-frontend - Run Next.js type check and lint tests"

setup:
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env file. Please edit with real secrets before starting."; fi
	@mkdir -p config/tls scripts docs

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f --tail=100

status:
	$(COMPOSE) ps

dkim-gen:
	@echo "Generating 2048-bit RSA DKIM Keypair for ivanaffriandi.com..."
	@bash scripts/dkim-rotate.sh

backup:
	@bash scripts/backup.sh

restore:
	@bash scripts/restore.sh

test-backend:
	@docker compose exec backend pytest app/tests/ -v

test-frontend:
	@docker compose exec frontend npm run lint && docker compose exec frontend npm run type-check
