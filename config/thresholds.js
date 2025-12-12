// =============================================================================
// Test Thresholds and Load Profiles
// =============================================================================
//
// Defines performance thresholds and load patterns for each test type.
// Thresholds are tuned for local Kind/Minikube clusters and may need
// adjustment for production environments.
//
// Test Types
// ----------
// - smoke      : Quick health validation (1 VU, 10s)
// - load       : Normal traffic simulation (10-50 VUs, ~7.5min)
// - stress     : Beyond normal capacity (5-20 VUs, ~18min)
// - spike      : Sudden traffic bursts (3-25 VUs, ~2.5min)
// - soak       : Extended duration (5 VUs, ~34min)
// - breakpoint : Increasing load until failure (10-100 req/s, ~10min)
//
// Thresholds Explained
// --------------------
// - http_req_failed    : Acceptable failure rate (e.g., rate<0.05 = <5%)
// - http_req_duration  : Response time percentiles (e.g., p(95)<3000ms)
// - http_reqs          : Minimum request throughput
// - checks             : Pass rate for k6 check() assertions
//
// Load Profile Executors
// ----------------------
// - constant-vus        : Fixed number of virtual users
// - ramping-vus         : VUs change over stages
// - ramping-arrival-rate: Request rate changes over stages
//
// Usage
// -----
// Import and use buildOptions() in test files:
//   import { buildOptions } from '../config/thresholds.js';
//   export const options = buildOptions('smoke', 'model-wine', scenarios);
//
// See Also
// --------
// - k6 docs: https://k6.io/docs/using-k6/thresholds/
// - k6 executors: https://k6.io/docs/using-k6/scenarios/executors/
// =============================================================================

// -----------------------------------------------------------------------------
// Performance Thresholds by Test Type
// -----------------------------------------------------------------------------
// These thresholds determine pass/fail criteria for each test type.
// Adjust based on your SLA requirements and infrastructure capacity.
export const THRESHOLDS = {
  smoke: {
    'http_req_failed': ['rate<0.10'],
    'http_req_duration': ['p(95)<3000'],
    'checks': ['rate>0.90'],
  },
  load: {
    'http_req_failed': ['rate<0.05'],
    'http_req_duration': ['p(95)<2500'],
    'http_reqs': ['rate>5'],
    'checks': ['rate>0.90'],
  },
  stress: {
    'http_req_failed': ['rate<0.10'],
    'http_req_duration': ['p(95)<4000'],
    'checks': ['rate>0.85'],
  },
  spike: {
    'http_req_failed': ['rate<0.15'],
    'http_req_duration': ['p(95)<5000'],
    'checks': ['rate>0.80'],
  },
  soak: {
    'http_req_failed': ['rate<0.05'],
    'http_req_duration': ['p(95)<3000'],
    'checks': ['rate>0.90'],
  },
  breakpoint: {
    'http_req_failed': ['rate<0.50'],
    'http_req_duration': ['p(95)<10000'],
    'checks': ['rate>0.50'],
  },
};

// -----------------------------------------------------------------------------
// Load Profiles by Test Type
// -----------------------------------------------------------------------------
// Defines the virtual user (VU) patterns and durations for each test type.
// Stages represent phases: ramp-up → steady-state → ramp-down.
export const LOAD_PROFILES = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '10s',
  },
  load: {
    executor: 'ramping-vus',
    stages: [
      { duration: '30s', target: 10 },  // Warm up, baseline at 1 replica
      { duration: '1m', target: 10 },   // Hold - show stable metrics
      { duration: '30s', target: 30 },  // Trigger scale to 2
      { duration: '2m', target: 30 },   // Hold - replica comes up
      { duration: '30s', target: 50 },  // Trigger scale to 3-4
      { duration: '2m', target: 50 },   // Hold at peak
      { duration: '1m', target: 0 },    // Ramp down
    ],
  },
  stress: {
    executor: 'ramping-vus',
    stages: [
      { duration: '1m', target: 5 },    // Baseline
      { duration: '3m', target: 10 },   // Slow climb
      { duration: '3m', target: 10 },   // HOLD
      { duration: '3m', target: 20 },   // Push
      { duration: '3m', target: 20 },   // HOLD
      { duration: '3m', target: 5 },    // Drop
      { duration: '2m', target: 5 },    // HOLD
    ],
  },
  spike: {
    executor: 'ramping-vus',
    stages: [
      { duration: '30s', target: 3 },
      { duration: '10s', target: 25 },
      { duration: '1m', target: 25 },
      { duration: '10s', target: 3 },
      { duration: '30s', target: 0 },
    ],
  },
  soak: {
    executor: 'ramping-vus',
    stages: [
      { duration: '2m', target: 5 },
      { duration: '30m', target: 5 },
      { duration: '2m', target: 0 },
    ],
  },
  breakpoint: {
    executor: 'ramping-arrival-rate',
    startRate: 10,
    timeUnit: '1s',
    preAllocatedVUs: 50,
    maxVUs: 100,
    stages: [
      { duration: '2m', target: 20 },
      { duration: '2m', target: 40 },
      { duration: '2m', target: 60 },
      { duration: '2m', target: 80 },
      { duration: '2m', target: 100 },
    ],
  },
};

// -----------------------------------------------------------------------------
// buildOptions() - Construct k6 Options Object
// -----------------------------------------------------------------------------
/**
 * Build k6 options with proper tagging for Grafana filtering.
 *
 * Creates a complete k6 options object with:
 * - Configured scenarios with load profiles
 * - Thresholds for pass/fail determination
 * - Tags for Grafana dashboard filtering
 * - Summary statistics configuration
 *
 * @param {string} testType - Test type: smoke, load, stress, spike, soak, breakpoint
 * @param {string} testTarget - Target identifier (e.g., 'platform-mlops', 'model-wine')
 * @param {object} scenarios - Named scenarios with exec functions (optional)
 * @param {object} extraThresholds - Additional per-scenario thresholds (optional)
 * @returns {object} Complete k6 options object
 *
 * @example
 * // Basic usage
 * export const options = buildOptions('smoke', 'model-wine');
 *
 * @example
 * // With custom scenarios and thresholds
 * export const options = buildOptions('load', 'model-wine', {
 *   'wine-health': { exec: 'testHealth' },
 *   'wine-predict': { exec: 'testPredict' },
 * }, {
 *   'http_req_duration{scenario:wine-predict}': ['p(95)<5000'],
 * });
 */
export function buildOptions(testType, testTarget, scenarios = null, extraThresholds = {}) {
  const profile = LOAD_PROFILES[testType];
  const thresholds = { ...THRESHOLDS[testType], ...extraThresholds };

  if (!profile) {
    throw new Error(`Unknown test type: ${testType}`);
  }

  // If no scenarios provided, use default with profile settings
  const finalScenarios = scenarios || {
    default: {
      ...profile,
      tags: { scenario: 'default' },
    },
  };

  // Apply load profile to each scenario
  const configuredScenarios = {};
  let startTime = 0;

  for (const [name, scenario] of Object.entries(finalScenarios)) {
    configuredScenarios[name] = {
      ...profile,
      ...scenario,
      startTime: scenario.startTime || `${startTime}s`,
      tags: { scenario: name, ...scenario.tags },
    };
    // Stagger scenarios slightly if not specified
    if (!scenario.startTime) {
      startTime += 2;
    }
  }

  return {
    scenarios: configuredScenarios,
    thresholds,
    tags: {
      test_type: testType,
      test_target: testTarget,
    },
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  };
}