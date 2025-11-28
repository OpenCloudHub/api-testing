// config/thresholds.js
// Thresholds and load profiles per test type

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

export const LOAD_PROFILES = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '10s',
  },
  load: {
    executor: 'ramping-vus',
    stages: [
      { duration: '1m', target: 5 },
      { duration: '3m', target: 5 },
      { duration: '1m', target: 10 },
      { duration: '3m', target: 10 },
      { duration: '1m', target: 0 },
    ],
  },
  stress: {
    executor: 'ramping-vus',
    stages: [
      { duration: '1m', target: 5 },
      { duration: '2m', target: 10 },
      { duration: '2m', target: 15 },
      { duration: '2m', target: 20 },
      { duration: '1m', target: 0 },
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

/**
 * Build k6 options with proper tagging for Grafana filtering
 * @param {string} testType - smoke, load, stress, spike, soak, breakpoint
 * @param {string} testTarget - e.g., 'platform-mlops', 'model-wine'
 * @param {object} scenarios - Named scenarios with exec functions
 * @param {object} extraThresholds - Additional per-scenario thresholds
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