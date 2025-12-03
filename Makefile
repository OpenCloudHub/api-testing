# =============================================================================
# K6 Test Suite Makefile
# =============================================================================
#
# Test orchestration for k6 performance tests with Grafana-compatible tagging.
# Provides standardized commands for running different test types across
# all platform services and ML models.
#
# Test Types
# ----------
# - smoke      : Quick health validation (1 VU, 10s)
# - load       : Normal traffic simulation (5-10 VUs, ~9min)
# - stress     : Beyond normal capacity (5-20 VUs, ~18min)
# - spike      : Sudden traffic bursts (3-25 VUs, ~2.5min)
# - soak       : Extended duration (5 VUs, 34min)
# - breakpoint : Increasing load until failure (10-100 req/s, ~10min)
#
# Quick Start
# -----------
#   make help            # Show all available targets
#   make smoke           # Run all smoke tests
#   make smoke-fashion-mnist  # Run specific test
#   TEST_ENV=internal make smoke  # Use different environment
#
# Output
# ------
# Results are saved to results/<timestamp>/ with:
# - <test-type>-<target>.json         : Full k6 output
# - <test-type>-<target>-summary.json : Aggregated metrics
#
# Grafana Integration
# -------------------
# All tests are tagged for Grafana filtering:
# - testid      : Unique timestamp for each run
# - test_type   : smoke, load, stress, spike, soak, breakpoint
# - test_target : Service identifier (e.g., platform-mlops, model-wine)
#
# See Also
# --------
# - README.md             : Full documentation
# - config/thresholds.js  : Load profiles and thresholds
# - config/environments.js: Service URLs per environment
# =============================================================================

# -----------------------------------------------------------------------------
# Configuration Variables
# -----------------------------------------------------------------------------
# TEST_ENV: Target environment (dev, internal). Override with: TEST_ENV=internal make smoke
TEST_ENV ?= dev
RESULTS_DIR := results
TIMESTAMP := $(shell date +%Y%m%d-%H%M%S)
RUN_DIR := $(RESULTS_DIR)/$(TIMESTAMP)

# Base k6 command with TLS skip for self-signed certs
K6 := k6 run --insecure-skip-tls-verify -e TEST_ENV=$(TEST_ENV)

# Terminal colors for output formatting
GREEN := \033[0;32m
CYAN := \033[0;36m
YELLOW := \033[0;33m
NC := \033[0m

# Create timestamped results directory
$(RUN_DIR):
	@mkdir -p $(RUN_DIR)

# -----------------------------------------------------------------------------
# Generic Test Runner Macro
# -----------------------------------------------------------------------------
# Standardized test execution with tagging and output configuration.
# Usage: $(call run_k6,<test_type>,<test_target>,<script_path>)
define run_k6
	@echo ""
	@echo "$(CYAN)════════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)🧪 $(1) test: $(2)$(NC)"
	@echo "$(CYAN)════════════════════════════════════════════════════════════════$(NC)"
	@echo "📋 testid: $(TIMESTAMP)"
	@echo "📋 test_type: $(1)"
	@echo "📋 test_target: $(2)"
	@echo ""
	$(K6) $(3) \
		--tag testid=$(TIMESTAMP) \
		--tag test_type=$(1) \
		--tag test_target=$(2) \
		--out json=$(RUN_DIR)/$(1)-$(2).json \
		--summary-export=$(RUN_DIR)/$(1)-$(2)-summary.json
	@echo ""
	@echo "$(GREEN)✅ Complete: $(1)-$(2)$(NC)"
	@echo "$(YELLOW)📊 Grafana: testid=$(TIMESTAMP), test_type=$(1), test_target=$(2)$(NC)"
	@echo ""
endef

# ============================================================================
# SMOKE TESTS
# ============================================================================

.PHONY: smoke
smoke: smoke-platform smoke-models smoke-apps  ## Run all smoke tests

.PHONY: smoke-platform
smoke-platform: smoke-mlops smoke-gitops smoke-infra smoke-obs  ## Platform smoke tests

.PHONY: smoke-mlops
smoke-mlops: $(RUN_DIR)
	$(call run_k6,smoke,platform-mlops,tests/01-smoke/platform/mlops.js)

.PHONY: smoke-gitops
smoke-gitops: $(RUN_DIR)
	$(call run_k6,smoke,platform-gitops,tests/01-smoke/platform/gitops.js)

.PHONY: smoke-infra
smoke-infra: $(RUN_DIR)
	$(call run_k6,smoke,platform-infra,tests/01-smoke/platform/infrastructure.js)

.PHONY: smoke-obs
smoke-obs: $(RUN_DIR)
	$(call run_k6,smoke,platform-obs,tests/01-smoke/platform/observability.js)

.PHONY: smoke-models
smoke-models: smoke-fashion-mnist smoke-wine smoke-qwen  ## Model smoke tests

.PHONY: smoke-fashion-mnist
smoke-fashion-mnist: $(RUN_DIR)
	$(call run_k6,smoke,model-fashion-mnist,tests/01-smoke/models/custom/fashion-mnist.js)

.PHONY: smoke-wine
smoke-wine: $(RUN_DIR)
	$(call run_k6,smoke,model-wine,tests/01-smoke/models/custom/wine.js)

.PHONY: smoke-qwen
smoke-qwen: $(RUN_DIR)
	$(call run_k6,smoke,model-qwen,tests/01-smoke/models/base/qwen.js)

.PHONY: smoke-apps
smoke-apps: smoke-backend  ## App smoke tests

.PHONY: smoke-backend
smoke-backend: $(RUN_DIR)
	$(call run_k6,smoke,app-backend,tests/01-smoke/apps/demo-backend.js)

# ============================================================================
# LOAD TESTS
# ============================================================================

.PHONY: load
load: load-platform load-models load-apps  ## Run all load tests

.PHONY: load-platform
load-platform: load-mlops load-gitops load-infra load-obs

.PHONY: load-mlops
load-mlops: $(RUN_DIR)
	$(call run_k6,load,platform-mlops,tests/02-load/platform/mlops.js)

.PHONY: load-gitops
load-gitops: $(RUN_DIR)
	$(call run_k6,load,platform-gitops,tests/02-load/platform/gitops.js)

.PHONY: load-infra
load-infra: $(RUN_DIR)
	$(call run_k6,load,platform-infra,tests/02-load/platform/infrastructure.js)

.PHONY: load-obs
load-obs: $(RUN_DIR)
	$(call run_k6,load,platform-obs,tests/02-load/platform/observability.js)

.PHONY: load-models
load-models: load-fashion-mnist load-wine load-qwen

.PHONY: load-fashion-mnist
load-fashion-mnist: $(RUN_DIR)
	$(call run_k6,load,model-fashion-mnist,tests/02-load/models/custom/fashion-mnist.js)

.PHONY: load-wine
load-wine: $(RUN_DIR)
	$(call run_k6,load,model-wine,tests/02-load/models/custom/wine.js)

.PHONY: load-qwen
load-qwen: $(RUN_DIR)
	$(call run_k6,load,model-qwen,tests/02-load/models/base/qwen.js)

.PHONY: load-apps
load-apps: load-backend

.PHONY: load-backend
load-backend: $(RUN_DIR)
	$(call run_k6,load,app-backend,tests/02-load/apps/demo-backend.js)

# ============================================================================
# STRESS TESTS
# ============================================================================

.PHONY: stress
stress: stress-platform stress-models stress-apps  ## Run all stress tests

.PHONY: stress-platform
stress-platform: stress-mlops stress-gitops stress-infra stress-obs

.PHONY: stress-mlops
stress-mlops: $(RUN_DIR)
	$(call run_k6,stress,platform-mlops,tests/03-stress/platform/mlops.js)

.PHONY: stress-gitops
stress-gitops: $(RUN_DIR)
	$(call run_k6,stress,platform-gitops,tests/03-stress/platform/gitops.js)

.PHONY: stress-infra
stress-infra: $(RUN_DIR)
	$(call run_k6,stress,platform-infra,tests/03-stress/platform/infrastructure.js)

.PHONY: stress-obs
stress-obs: $(RUN_DIR)
	$(call run_k6,stress,platform-obs,tests/03-stress/platform/observability.js)

.PHONY: stress-models
stress-models: stress-fashion-mnist stress-wine stress-qwen

.PHONY: stress-fashion-mnist
stress-fashion-mnist: $(RUN_DIR)
	$(call run_k6,stress,model-fashion-mnist,tests/03-stress/models/custom/fashion-mnist.js)

.PHONY: stress-wine
stress-wine: $(RUN_DIR)
	$(call run_k6,stress,model-wine,tests/03-stress/models/custom/wine.js)

.PHONY: stress-qwen
stress-qwen: $(RUN_DIR)
	$(call run_k6,stress,model-qwen,tests/03-stress/models/base/qwen.js)

.PHONY: stress-apps
stress-apps: stress-backend

.PHONY: stress-backend
stress-backend: $(RUN_DIR)
	$(call run_k6,stress,app-backend,tests/03-stress/apps/demo-backend.js)

# ============================================================================
# SPIKE TESTS
# ============================================================================

.PHONY: spike
spike: spike-platform spike-models spike-apps  ## Run all spike tests

.PHONY: spike-platform
spike-platform: spike-mlops spike-gitops spike-infra spike-obs

.PHONY: spike-mlops
spike-mlops: $(RUN_DIR)
	$(call run_k6,spike,platform-mlops,tests/04-spike/platform/mlops.js)

.PHONY: spike-gitops
spike-gitops: $(RUN_DIR)
	$(call run_k6,spike,platform-gitops,tests/04-spike/platform/gitops.js)

.PHONY: spike-infra
spike-infra: $(RUN_DIR)
	$(call run_k6,spike,platform-infra,tests/04-spike/platform/infrastructure.js)

.PHONY: spike-obs
spike-obs: $(RUN_DIR)
	$(call run_k6,spike,platform-obs,tests/04-spike/platform/observability.js)

.PHONY: spike-models
spike-models: spike-fashion-mnist spike-wine spike-qwen

.PHONY: spike-fashion-mnist
spike-fashion-mnist: $(RUN_DIR)
	$(call run_k6,spike,model-fashion-mnist,tests/04-spike/models/custom/fashion-mnist.js)

.PHONY: spike-wine
spike-wine: $(RUN_DIR)
	$(call run_k6,spike,model-wine,tests/04-spike/models/custom/wine.js)

.PHONY: spike-qwen
spike-qwen: $(RUN_DIR)
	$(call run_k6,spike,model-qwen,tests/04-spike/models/base/qwen.js)

.PHONY: spike-apps
spike-apps: spike-backend

.PHONY: spike-backend
spike-backend: $(RUN_DIR)
	$(call run_k6,spike,app-backend,tests/04-spike/apps/demo-backend.js)

# ============================================================================
# SOAK TESTS (long running)
# ============================================================================

.PHONY: soak
soak: soak-platform soak-models soak-apps  ## Run all soak tests (30+ min each!)

.PHONY: soak-platform
soak-platform: soak-mlops soak-gitops soak-infra soak-obs

.PHONY: soak-mlops
soak-mlops: $(RUN_DIR)
	$(call run_k6,soak,platform-mlops,tests/05-soak/platform/mlops.js)

.PHONY: soak-gitops
soak-gitops: $(RUN_DIR)
	$(call run_k6,soak,platform-gitops,tests/05-soak/platform/gitops.js)

.PHONY: soak-infra
soak-infra: $(RUN_DIR)
	$(call run_k6,soak,platform-infra,tests/05-soak/platform/infrastructure.js)

.PHONY: soak-obs
soak-obs: $(RUN_DIR)
	$(call run_k6,soak,platform-obs,tests/05-soak/platform/observability.js)

.PHONY: soak-models
soak-models: soak-fashion-mnist soak-wine soak-qwen

.PHONY: soak-fashion-mnist
soak-fashion-mnist: $(RUN_DIR)
	$(call run_k6,soak,model-fashion-mnist,tests/05-soak/models/custom/fashion-mnist.js)

.PHONY: soak-wine
soak-wine: $(RUN_DIR)
	$(call run_k6,soak,model-wine,tests/05-soak/models/custom/wine.js)

.PHONY: soak-qwen
soak-qwen: $(RUN_DIR)
	$(call run_k6,soak,model-qwen,tests/05-soak/models/base/qwen.js)

.PHONY: soak-apps
soak-apps: soak-backend

.PHONY: soak-backend
soak-backend: $(RUN_DIR)
	$(call run_k6,soak,app-backend,tests/05-soak/apps/demo-backend.js)

# ============================================================================
# BREAKPOINT TESTS
# ============================================================================

.PHONY: breakpoint
breakpoint: breakpoint-platform breakpoint-models breakpoint-apps  ## Run all breakpoint tests

.PHONY: breakpoint-platform
breakpoint-platform: breakpoint-mlops breakpoint-gitops breakpoint-infra breakpoint-obs

.PHONY: breakpoint-mlops
breakpoint-mlops: $(RUN_DIR)
	$(call run_k6,breakpoint,platform-mlops,tests/06-breakpoint/platform/mlops.js)

.PHONY: breakpoint-gitops
breakpoint-gitops: $(RUN_DIR)
	$(call run_k6,breakpoint,platform-gitops,tests/06-breakpoint/platform/gitops.js)

.PHONY: breakpoint-infra
breakpoint-infra: $(RUN_DIR)
	$(call run_k6,breakpoint,platform-infra,tests/06-breakpoint/platform/infrastructure.js)

.PHONY: breakpoint-obs
breakpoint-obs: $(RUN_DIR)
	$(call run_k6,breakpoint,platform-obs,tests/06-breakpoint/platform/observability.js)

.PHONY: breakpoint-models
breakpoint-models: breakpoint-fashion-mnist breakpoint-wine breakpoint-qwen

.PHONY: breakpoint-fashion-mnist
breakpoint-fashion-mnist: $(RUN_DIR)
	$(call run_k6,breakpoint,model-fashion-mnist,tests/06-breakpoint/models/custom/fashion-mnist.js)

.PHONY: breakpoint-wine
breakpoint-wine: $(RUN_DIR)
	$(call run_k6,breakpoint,model-wine,tests/06-breakpoint/models/custom/wine.js)

.PHONY: breakpoint-qwen
breakpoint-qwen: $(RUN_DIR)
	$(call run_k6,breakpoint,model-qwen,tests/06-breakpoint/models/base/qwen.js)

.PHONY: breakpoint-apps
breakpoint-apps: breakpoint-backend

.PHONY: breakpoint-backend
breakpoint-backend: $(RUN_DIR)
	$(call run_k6,breakpoint,app-backend,tests/06-breakpoint/apps/demo-backend.js)

# ============================================================================
# COMBINED SUITES
# ============================================================================

.PHONY: full-platform
full-platform: smoke-platform load-platform stress-platform spike-platform  ## Full platform test suite

.PHONY: full-mlops
full-mlops: smoke-mlops load-mlops stress-mlops spike-mlops  ## Full MLOps test suite

.PHONY: quick
quick: smoke-platform  ## Quick smoke test for CI

# ============================================================================
# UTILITIES
# ============================================================================

.PHONY: clean
clean:  ## Clean results directory
	rm -rf $(RESULTS_DIR)/*

.PHONY: list
list:  ## List available tests
	@echo "Available tests:"
	@find tests -name "*.js" 2>/dev/null | sort

.PHONY: summary
summary:  ## Show summary of latest results
	@./scripts/summary.sh $(shell ls -td $(RESULTS_DIR)/*/ 2>/dev/null | head -1)

.PHONY: help
help:  ## Show this help
	@echo "$(CYAN)k6 Test Runner$(NC)"
	@echo ""
	@echo "$(YELLOW)Test Types:$(NC)"
	@echo "  smoke      - Quick health checks (10s)"
	@echo "  load       - Normal load (~9min)"
	@echo "  stress     - Beyond normal (~8min)"
	@echo "  spike      - Sudden bursts (~2.5min)"
	@echo "  soak       - Extended duration (~34min)"
	@echo "  breakpoint - Find limits (~10min)"
	@echo ""
	@echo "$(YELLOW)Targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

.DEFAULT_GOAL := help