// config/thresholds.js
// Thresholds and load profiles per test type - tuned for local Minikube/Kind

// Thresholds by test type
export const THRESHOLDS = {
  smoke: {
    http_req_failed: ['rate<0.10'],       // 10% error rate OK for quick checks
    http_req_duration: ['p(95)<3000'],    // 3s - local can be slow
    checks: ['rate>0.90'],                // 90% checks pass
  },
  load: {
    http_req_failed: ['rate<0.05'],       // 5% error rate
    http_req_duration: ['p(95)<2500'],    // 2.5s
    http_reqs: ['rate>5'],                // At least 5 req/s throughput
    checks: ['rate>0.90'],
  },
  stress: {
    http_req_failed: ['rate<0.10'],       // 10% - expect some failures
    http_req_duration: ['p(95)<4000'],    // 4s
    checks: ['rate>0.85'],
  },
  spike: {
    http_req_failed: ['rate<0.15'],       // 15% - spikes cause failures
    http_req_duration: ['p(95)<5000'],    // 5s
    checks: ['rate>0.80'],
  },
  soak: {
    http_req_failed: ['rate<0.05'],       // 5% over long duration
    http_req_duration: ['p(95)<3000'],    // 3s steady state
    checks: ['rate>0.90'],
  },
  breakpoint: {
    http_req_failed: ['rate<0.50'],       // 50% - finding the limit
    http_req_duration: ['p(95)<10000'],   // 10s
    checks: ['rate>0.50'],
  },
};

// Load profiles (VUs and duration) by test type
export const LOAD_PROFILES = {
  smoke: {
    vus: 1,
    duration: '10s',
  },
  load: {
    stages: [
      { duration: '1m', target: 5 },      // Ramp up
      { duration: '3m', target: 5 },      // Steady state
      { duration: '1m', target: 10 },     // Increase
      { duration: '3m', target: 10 },     // Steady
      { duration: '1m', target: 0 },      // Ramp down
    ],
  },
  stress: {
    stages: [
      { duration: '1m', target: 5 },      // Warm up
      { duration: '2m', target: 10 },     // Normal
      { duration: '2m', target: 15 },     // Push
      { duration: '2m', target: 20 },     // Stress
      { duration: '1m', target: 0 },      // Recover
    ],
  },
  spike: {
    stages: [
      { duration: '30s', target: 3 },     // Normal
      { duration: '10s', target: 25 },    // Spike!
      { duration: '1m', target: 25 },     // Hold
      { duration: '10s', target: 3 },     // Drop
      { duration: '30s', target: 0 },     // Cool down
    ],
  },
  soak: {
    stages: [
      { duration: '2m', target: 5 },      // Ramp up
      { duration: '30m', target: 5 },     // Soak (30min for local, not hours)
      { duration: '2m', target: 0 },      // Ramp down
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

/**
 * Build k6 options object for a test type
 * @param {string} testType - smoke, load, stress, spike, soak, breakpoint
 * @param {object} extraThresholds - Additional thresholds to merge
 * @returns {object} k6 options
 */
export function buildOptions(testType, extraThresholds = {}) {
  const profile = LOAD_PROFILES[testType];
  const thresholds = THRESHOLDS[testType];

  if (!profile || !thresholds) {
    throw new Error(`Unknown test type: ${testType}`);
  }

  return {
    ...profile,
    thresholds: { ...thresholds, ...extraThresholds },
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  };
}