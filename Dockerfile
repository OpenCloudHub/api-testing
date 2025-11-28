# Dockerfile
FROM grafana/k6:latest

# Copy test files
COPY config/ /tests/config/
COPY helpers/ /tests/helpers/
COPY tests/ /tests/tests/
COPY data/ /tests/data/

WORKDIR /tests