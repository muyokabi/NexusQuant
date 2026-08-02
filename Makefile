.PHONY: install build test run-frontend run-ingestion docker-up docker-down clean

# System-wide local bootstrap setup
install:
	./setup_local.sh

# Compile all workspace applications and packages
build:
	pnpm build

# Run all test suites
test:
	pnpm test

# Run local development server for frontend
run-frontend:
	pnpm --filter @nexusquant/desktop-frontend run dev

# Run ingestion engine service
run-ingestion:
	cd services/ingestion-engine && python src/main.py

# Launch database and ingestion containers
docker-up:
	docker-compose up -d

# Spin down active container pods
docker-down:
	docker-compose down

# Flush all builds and cached packages
clean:
	rm -rf node_modules
	rm -rf apps/desktop/frontend/dist
	find . -type d -name "__pycache__" -exec rm -rf {} +
