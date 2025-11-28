# k6-tests/Makefile
# Test orchestration for k6 performance tests

TEST_ENV ?= dev
RESULTS_DIR := results
RUN_DIR := $(RESULTS_DIR)/$(shell date +%Y-%m-%d_%H-%M-%S)

K6 := k6 run --insecure-skip-tls-verify -e TEST_ENV=$(TEST_ENV)

$(RUN_DIR):
	mkdir -p $(RUN_DIR)

# ============================================================================
# SMOKE TESTS
# ============================================================================

.PHONY: smoke
smoke: smoke-platform smoke-models smoke-apps  ## Run all smoke tests

.PHONY: smoke-platform
smoke-platform: smoke-platform-mlops smoke-platform-gitops smoke-platform-infra smoke-platform-obs  ## All platform smoke tests

.PHONY: smoke-platform-mlops
smoke-platform-mlops: $(RUN_DIR)
	@echo "🧪 Smoke: MLOps services"
	$(K6) tests/01-smoke/platform/mlops.js \
		--out json=$(RUN_DIR)/smoke-platform-mlops.json \
		--summary-export=$(RUN_DIR)/smoke-platform-mlops-summary.json

.PHONY: smoke-platform-gitops
smoke-platform-gitops: $(RUN_DIR)
	@echo "🧪 Smoke: GitOps services"
	$(K6) tests/01-smoke/platform/gitops.js \
		--out json=$(RUN_DIR)/smoke-platform-gitops.json \
		--summary-export=$(RUN_DIR)/smoke-platform-gitops-summary.json

.PHONY: smoke-platform-infra
smoke-platform-infra: $(RUN_DIR)
	@echo "🧪 Smoke: Infrastructure services"
	$(K6) tests/01-smoke/platform/infrastructure.js \
		--out json=$(RUN_DIR)/smoke-platform-infra.json \
		--summary-export=$(RUN_DIR)/smoke-platform-infra-summary.json

.PHONY: smoke-platform-obs
smoke-platform-obs: $(RUN_DIR)
	@echo "🧪 Smoke: Observability services"
	$(K6) tests/01-smoke/platform/observability.js \
		--out json=$(RUN_DIR)/smoke-platform-obs.json \
		--summary-export=$(RUN_DIR)/smoke-platform-obs-summary.json

.PHONY: smoke-models
smoke-models: smoke-models-custom smoke-models-base  ## All model smoke tests

.PHONY: smoke-models-custom
smoke-models-custom: smoke-fashion-mnist smoke-wine

.PHONY: smoke-models-base
smoke-models-base: smoke-qwen

.PHONY: smoke-fashion-mnist
smoke-fashion-mnist: $(RUN_DIR)
	@echo "🧪 Smoke: Fashion MNIST"
	$(K6) tests/01-smoke/models/custom/fashion-mnist.js \
		--out json=$(RUN_DIR)/smoke-fashion-mnist.json \
		--summary-export=$(RUN_DIR)/smoke-fashion-mnist-summary.json

.PHONY: smoke-wine
smoke-wine: $(RUN_DIR)
	@echo "🧪 Smoke: Wine classifier"
	$(K6) tests/01-smoke/models/custom/wine.js \
		--out json=$(RUN_DIR)/smoke-wine.json \
		--summary-export=$(RUN_DIR)/smoke-wine-summary.json

.PHONY: smoke-qwen
smoke-qwen: $(RUN_DIR)
	@echo "🧪 Smoke: Qwen LLM"
	$(K6) tests/01-smoke/models/base/qwen.js \
		--out json=$(RUN_DIR)/smoke-qwen.json \
		--summary-export=$(RUN_DIR)/smoke-qwen-summary.json

.PHONY: smoke-apps
smoke-apps: smoke-demo-backend

.PHONY: smoke-demo-backend
smoke-demo-backend: $(RUN_DIR)
	@echo "🧪 Smoke: Demo backend"
	$(K6) tests/01-smoke/apps/demo-backend.js \
		--out json=$(RUN_DIR)/smoke-demo-backend.json \
		--summary-export=$(RUN_DIR)/smoke-demo-backend-summary.json

# ============================================================================
# LOAD TESTS
# ============================================================================

.PHONY: load
load: load-platform load-models load-apps  ## Run all load tests

.PHONY: load-platform
load-platform: load-platform-mlops load-platform-gitops load-platform-infra load-platform-obs

.PHONY: load-platform-mlops
load-platform-mlops: $(RUN_DIR)
	@echo "📊 Load: MLOps services"
	$(K6) tests/02-load/platform/mlops.js \
		--out json=$(RUN_DIR)/load-platform-mlops.json \
		--summary-export=$(RUN_DIR)/load-platform-mlops-summary.json

.PHONY: load-platform-gitops
load-platform-gitops: $(RUN_DIR)
	@echo "📊 Load: GitOps services"
	$(K6) tests/02-load/platform/gitops.js \
		--out json=$(RUN_DIR)/load-platform-gitops.json \
		--summary-export=$(RUN_DIR)/load-platform-gitops-summary.json

.PHONY: load-platform-infra
load-platform-infra: $(RUN_DIR)
	@echo "📊 Load: Infrastructure services"
	$(K6) tests/02-load/platform/infrastructure.js \
		--out json=$(RUN_DIR)/load-platform-infra.json \
		--summary-export=$(RUN_DIR)/load-platform-infra-summary.json

.PHONY: load-platform-obs
load-platform-obs: $(RUN_DIR)
	@echo "📊 Load: Observability services"
	$(K6) tests/02-load/platform/observability.js \
		--out json=$(RUN_DIR)/load-platform-obs.json \
		--summary-export=$(RUN_DIR)/load-platform-obs-summary.json

.PHONY: load-models
load-models: load-models-custom load-models-base

.PHONY: load-models-custom
load-models-custom: load-fashion-mnist load-wine

.PHONY: load-models-base
load-models-base: load-qwen

.PHONY: load-fashion-mnist
load-fashion-mnist: $(RUN_DIR)
	@echo "📊 Load: Fashion MNIST"
	$(K6) tests/02-load/models/custom/fashion-mnist.js \
		--out json=$(RUN_DIR)/load-fashion-mnist.json \
		--summary-export=$(RUN_DIR)/load-fashion-mnist-summary.json

.PHONY: load-wine
load-wine: $(RUN_DIR)
	@echo "📊 Load: Wine classifier"
	$(K6) tests/02-load/models/custom/wine.js \
		--out json=$(RUN_DIR)/load-wine.json \
		--summary-export=$(RUN_DIR)/load-wine-summary.json

.PHONY: load-qwen
load-qwen: $(RUN_DIR)
	@echo "📊 Load: Qwen LLM"
	$(K6) tests/02-load/models/base/qwen.js \
		--out json=$(RUN_DIR)/load-qwen.json \
		--summary-export=$(RUN_DIR)/load-qwen-summary.json

.PHONY: load-apps
load-apps: load-demo-backend

.PHONY: load-demo-backend
load-demo-backend: $(RUN_DIR)
	@echo "📊 Load: Demo backend"
	$(K6) tests/02-load/apps/demo-backend.js \
		--out json=$(RUN_DIR)/load-demo-backend.json \
		--summary-export=$(RUN_DIR)/load-demo-backend-summary.json

# ============================================================================
# STRESS TESTS
# ============================================================================

.PHONY: stress
stress: stress-platform stress-models stress-apps  ## Run all stress tests

.PHONY: stress-platform
stress-platform: stress-platform-mlops stress-platform-gitops stress-platform-infra stress-platform-obs

.PHONY: stress-platform-mlops
stress-platform-mlops: $(RUN_DIR)
	@echo "💪 Stress: MLOps services"
	$(K6) tests/03-stress/platform/mlops.js \
		--out json=$(RUN_DIR)/stress-platform-mlops.json \
		--summary-export=$(RUN_DIR)/stress-platform-mlops-summary.json

.PHONY: stress-platform-gitops
stress-platform-gitops: $(RUN_DIR)
	@echo "💪 Stress: GitOps services"
	$(K6) tests/03-stress/platform/gitops.js \
		--out json=$(RUN_DIR)/stress-platform-gitops.json \
		--summary-export=$(RUN_DIR)/stress-platform-gitops-summary.json

.PHONY: stress-platform-infra
stress-platform-infra: $(RUN_DIR)
	@echo "💪 Stress: Infrastructure services"
	$(K6) tests/03-stress/platform/infrastructure.js \
		--out json=$(RUN_DIR)/stress-platform-infra.json \
		--summary-export=$(RUN_DIR)/stress-platform-infra-summary.json

.PHONY: stress-platform-obs
stress-platform-obs: $(RUN_DIR)
	@echo "💪 Stress: Observability services"
	$(K6) tests/03-stress/platform/observability.js \
		--out json=$(RUN_DIR)/stress-platform-obs.json \
		--summary-export=$(RUN_DIR)/stress-platform-obs-summary.json

.PHONY: stress-models
stress-models: stress-fashion-mnist stress-wine stress-qwen

.PHONY: stress-fashion-mnist
stress-fashion-mnist: $(RUN_DIR)
	@echo "💪 Stress: Fashion MNIST"
	$(K6) tests/03-stress/models/custom/fashion-mnist.js \
		--out json=$(RUN_DIR)/stress-fashion-mnist.json \
		--summary-export=$(RUN_DIR)/stress-fashion-mnist-summary.json

.PHONY: stress-wine
stress-wine: $(RUN_DIR)
	@echo "💪 Stress: Wine classifier"
	$(K6) tests/03-stress/models/custom/wine.js \
		--out json=$(RUN_DIR)/stress-wine.json \
		--summary-export=$(RUN_DIR)/stress-wine-summary.json

.PHONY: stress-qwen
stress-qwen: $(RUN_DIR)
	@echo "💪 Stress: Qwen LLM"
	$(K6) tests/03-stress/models/base/qwen.js \
		--out json=$(RUN_DIR)/stress-qwen.json \
		--summary-export=$(RUN_DIR)/stress-qwen-summary.json

.PHONY: stress-apps
stress-apps: stress-demo-backend

.PHONY: stress-demo-backend
stress-demo-backend: $(RUN_DIR)
	@echo "💪 Stress: Demo backend"
	$(K6) tests/03-stress/apps/demo-backend.js \
		--out json=$(RUN_DIR)/stress-demo-backend.json \
		--summary-export=$(RUN_DIR)/stress-demo-backend-summary.json

# ============================================================================
# SPIKE TESTS
# ============================================================================

.PHONY: spike
spike: spike-platform spike-models spike-apps  ## Run all spike tests

.PHONY: spike-platform
spike-platform: spike-platform-mlops spike-platform-gitops spike-platform-infra spike-platform-obs

.PHONY: spike-platform-mlops
spike-platform-mlops: $(RUN_DIR)
	@echo "📈 Spike: MLOps services"
	$(K6) tests/04-spike/platform/mlops.js \
		--out json=$(RUN_DIR)/spike-platform-mlops.json \
		--summary-export=$(RUN_DIR)/spike-platform-mlops-summary.json

.PHONY: spike-platform-gitops
spike-platform-gitops: $(RUN_DIR)
	@echo "📈 Spike: GitOps services"
	$(K6) tests/04-spike/platform/gitops.js \
		--out json=$(RUN_DIR)/spike-platform-gitops.json \
		--summary-export=$(RUN_DIR)/spike-platform-gitops-summary.json

.PHONY: spike-platform-infra
spike-platform-infra: $(RUN_DIR)
	@echo "📈 Spike: Infrastructure services"
	$(K6) tests/04-spike/platform/infrastructure.js \
		--out json=$(RUN_DIR)/spike-platform-infra.json \
		--summary-export=$(RUN_DIR)/spike-platform-infra-summary.json

.PHONY: spike-platform-obs
spike-platform-obs: $(RUN_DIR)
	@echo "📈 Spike: Observability services"
	$(K6) tests/04-spike/platform/observability.js \
		--out json=$(RUN_DIR)/spike-platform-obs.json \
		--summary-export=$(RUN_DIR)/spike-platform-obs-summary.json

.PHONY: spike-models
spike-models: spike-fashion-mnist spike-wine spike-qwen

.PHONY: spike-fashion-mnist
spike-fashion-mnist: $(RUN_DIR)
	@echo "📈 Spike: Fashion MNIST"
	$(K6) tests/04-spike/models/custom/fashion-mnist.js \
		--out json=$(RUN_DIR)/spike-fashion-mnist.json \
		--summary-export=$(RUN_DIR)/spike-fashion-mnist-summary.json

.PHONY: spike-wine
spike-wine: $(RUN_DIR)
	@echo "📈 Spike: Wine classifier"
	$(K6) tests/04-spike/models/custom/wine.js \
		--out json=$(RUN_DIR)/spike-wine.json \
		--summary-export=$(RUN_DIR)/spike-wine-summary.json

.PHONY: spike-qwen
spike-qwen: $(RUN_DIR)
	@echo "📈 Spike: Qwen LLM"
	$(K6) tests/04-spike/models/base/qwen.js \
		--out json=$(RUN_DIR)/spike-qwen.json \
		--summary-export=$(RUN_DIR)/spike-qwen-summary.json

.PHONY: spike-apps
spike-apps: spike-demo-backend

.PHONY: spike-demo-backend
spike-demo-backend: $(RUN_DIR)
	@echo "📈 Spike: Demo backend"
	$(K6) tests/04-spike/apps/demo-backend.js \
		--out json=$(RUN_DIR)/spike-demo-backend.json \
		--summary-export=$(RUN_DIR)/spike-demo-backend-summary.json

# ============================================================================
# SOAK TESTS
# ============================================================================

.PHONY: soak
soak: soak-platform soak-models soak-apps  ## Run all soak tests (long!)

.PHONY: soak-platform
soak-platform: soak-platform-mlops soak-platform-gitops soak-platform-infra soak-platform-obs

.PHONY: soak-platform-mlops
soak-platform-mlops: $(RUN_DIR)
	@echo "🕐 Soak: MLOps services"
	$(K6) tests/05-soak/platform/mlops.js \
		--out json=$(RUN_DIR)/soak-platform-mlops.json \
		--summary-export=$(RUN_DIR)/soak-platform-mlops-summary.json

.PHONY: soak-platform-gitops
soak-platform-gitops: $(RUN_DIR)
	@echo "🕐 Soak: GitOps services"
	$(K6) tests/05-soak/platform/gitops.js \
		--out json=$(RUN_DIR)/soak-platform-gitops.json \
		--summary-export=$(RUN_DIR)/soak-platform-gitops-summary.json

.PHONY: soak-platform-infra
soak-platform-infra: $(RUN_DIR)
	@echo "🕐 Soak: Infrastructure services"
	$(K6) tests/05-soak/platform/infrastructure.js \
		--out json=$(RUN_DIR)/soak-platform-infra.json \
		--summary-export=$(RUN_DIR)/soak-platform-infra-summary.json

.PHONY: soak-platform-obs
soak-platform-obs: $(RUN_DIR)
	@echo "🕐 Soak: Observability services"
	$(K6) tests/05-soak/platform/observability.js \
		--out json=$(RUN_DIR)/soak-platform-obs.json \
		--summary-export=$(RUN_DIR)/soak-platform-obs-summary.json

.PHONY: soak-models
soak-models: soak-fashion-mnist soak-wine soak-qwen

.PHONY: soak-fashion-mnist
soak-fashion-mnist: $(RUN_DIR)
	@echo "🕐 Soak: Fashion MNIST"
	$(K6) tests/05-soak/models/custom/fashion-mnist.js \
		--out json=$(RUN_DIR)/soak-fashion-mnist.json \
		--summary-export=$(RUN_DIR)/soak-fashion-mnist-summary.json

.PHONY: soak-wine
soak-wine: $(RUN_DIR)
	@echo "🕐 Soak: Wine classifier"
	$(K6) tests/05-soak/models/custom/wine.js \
		--out json=$(RUN_DIR)/soak-wine.json \
		--summary-export=$(RUN_DIR)/soak-wine-summary.json

.PHONY: soak-qwen
soak-qwen: $(RUN_DIR)
	@echo "🕐 Soak: Qwen LLM"
	$(K6) tests/05-soak/models/base/qwen.js \
		--out json=$(RUN_DIR)/soak-qwen.json \
		--summary-export=$(RUN_DIR)/soak-qwen-summary.json

.PHONY: soak-apps
soak-apps: soak-demo-backend

.PHONY: soak-demo-backend
soak-demo-backend: $(RUN_DIR)
	@echo "🕐 Soak: Demo backend"
	$(K6) tests/05-soak/apps/demo-backend.js \
		--out json=$(RUN_DIR)/soak-demo-backend.json \
		--summary-export=$(RUN_DIR)/soak-demo-backend-summary.json

# ============================================================================
# BREAKPOINT TESTS
# ============================================================================

.PHONY: breakpoint
breakpoint: breakpoint-platform breakpoint-models breakpoint-apps  ## Run all breakpoint tests

.PHONY: breakpoint-platform
breakpoint-platform: breakpoint-platform-mlops breakpoint-platform-gitops breakpoint-platform-infra breakpoint-platform-obs

.PHONY: breakpoint-platform-mlops
breakpoint-platform-mlops: $(RUN_DIR)
	@echo "🔥 Breakpoint: MLOps services"
	$(K6) tests/06-breakpoint/platform/mlops.js \
		--out json=$(RUN_DIR)/breakpoint-platform-mlops.json \
		--summary-export=$(RUN_DIR)/breakpoint-platform-mlops-summary.json

.PHONY: breakpoint-platform-gitops
breakpoint-platform-gitops: $(RUN_DIR)
	@echo "🔥 Breakpoint: GitOps services"
	$(K6) tests/06-breakpoint/platform/gitops.js \
		--out json=$(RUN_DIR)/breakpoint-platform-gitops.json \
		--summary-export=$(RUN_DIR)/breakpoint-platform-gitops-summary.json

.PHONY: breakpoint-platform-infra
breakpoint-platform-infra: $(RUN_DIR)
	@echo "🔥 Breakpoint: Infrastructure services"
	$(K6) tests/06-breakpoint/platform/infrastructure.js \
		--out json=$(RUN_DIR)/breakpoint-platform-infra.json \
		--summary-export=$(RUN_DIR)/breakpoint-platform-infra-summary.json

.PHONY: breakpoint-platform-obs
breakpoint-platform-obs: $(RUN_DIR)
	@echo "🔥 Breakpoint: Observability services"
	$(K6) tests/06-breakpoint/platform/observability.js \
		--out json=$(RUN_DIR)/breakpoint-platform-obs.json \
		--summary-export=$(RUN_DIR)/breakpoint-platform-obs-summary.json

.PHONY: breakpoint-models
breakpoint-models: breakpoint-fashion-mnist breakpoint-wine breakpoint-qwen

.PHONY: breakpoint-fashion-mnist
breakpoint-fashion-mnist: $(RUN_DIR)
	@echo "🔥 Breakpoint: Fashion MNIST"
	$(K6) tests/06-breakpoint/models/custom/fashion-mnist.js \
		--out json=$(RUN_DIR)/breakpoint-fashion-mnist.json \
		--summary-export=$(RUN_DIR)/breakpoint-fashion-mnist-summary.json

.PHONY: breakpoint-wine
breakpoint-wine: $(RUN_DIR)
	@echo "🔥 Breakpoint: Wine classifier"
	$(K6) tests/06-breakpoint/models/custom/wine.js \
		--out json=$(RUN_DIR)/breakpoint-wine.json \
		--summary-export=$(RUN_DIR)/breakpoint-wine-summary.json

.PHONY: breakpoint-qwen
breakpoint-qwen: $(RUN_DIR)
	@echo "🔥 Breakpoint: Qwen LLM"
	$(K6) tests/06-breakpoint/models/base/qwen.js \
		--out json=$(RUN_DIR)/breakpoint-qwen.json \
		--summary-export=$(RUN_DIR)/breakpoint-qwen-summary.json

.PHONY: breakpoint-apps
breakpoint-apps: breakpoint-demo-backend

.PHONY: breakpoint-demo-backend
breakpoint-demo-backend: $(RUN_DIR)
	@echo "🔥 Breakpoint: Demo backend"
	$(K6) tests/06-breakpoint/apps/demo-backend.js \
		--out json=$(RUN_DIR)/breakpoint-demo-backend.json \
		--summary-export=$(RUN_DIR)/breakpoint-demo-backend-summary.json

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
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help