# =============================================================================
# K6 Test Suite Container Image
# =============================================================================
#
# Container image for running k6 performance tests in Kubernetes.
# Used by the k6-operator to execute tests inside the cluster.
#
# Contents
# --------
# - /tests/config/  : Environment and threshold configuration
# - /tests/helpers/ : Reusable test utilities
# - /tests/tests/   : Test scripts organized by type
# - /tests/data/    : Test data files (JSON)
#
# Build
# -----
#   docker build -t opencloudhub/k6-tests:latest .
#
# Usage (Local)
# -------------
#   docker run --rm opencloudhub/k6-tests:latest \
#     k6 run /tests/tests/01-smoke/platform/mlops.js
#
# Usage (Kubernetes)
# ------------------
# The k6-operator pulls this image and runs tests via TestRun CRDs.
# See README.md for TestRun examples.
#
# =============================================================================

FROM grafana/k6:latest

# Copy test files
COPY config/ /tests/config/
COPY helpers/ /tests/helpers/
COPY tests/ /tests/tests/
COPY data/ /tests/data/

WORKDIR /tests