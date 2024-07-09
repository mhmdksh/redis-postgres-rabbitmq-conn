# redis-postgres-rabbitmq-conn
A very simple Nodejs app to test the connection to Postgres DB, Redis Cache, and RabbitMQ
# Node.js Multi-Service Connector

🚀 **Node.js Multi-Service Connector** is a very simple Nodejs app to test the connection to Postgres DB, Redis Cache, and RabbitMQ

## Features

- **Reliable Connections:** Automatically retries connections to PostgreSQL, Redis, and RabbitMQ until successful.
- **Health Check Endpoint:** Exposes a `/health` endpoint to monitor the health of your application.
- **Web Status:** Displays the connection status of your services on a web page.
- **Environment Configuration:** Easily configure your services using environment variables.

## Getting Started
Follow these instructions to get the project up and running on your local machine.

### Prerequisites
- Docker & Docker Compose
- Your External Service URI like (RDS, Elasticache, RabbitMQ)

### Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/mhmdksh/redis-postgres-rabbitmq-conn.git
   cd redis-postgres-rabbitmq-conn
2. **Set up environment variables:**
Create a .env file in the root directory and add the following variables:
    ```sh
    POSTGRES_URI=your_postgres_uri
    REDIS_HOST=your_redis_host
    REDIS_PORT=your_redis_port
    RABBITMQ_URI=your_rabbitmq_uri
3. **Start the app:**
    ```sh
    docker compose up -d --build
### Usage
1. Access the web status page at http://localhost:8080.
2. Check the health of the application via the /health endpoint: http://localhost:8080/health.
