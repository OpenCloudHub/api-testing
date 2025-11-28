// helpers/http.js
// Simple HTTP utilities for k6 tests

import http from 'k6/http';
import { check } from 'k6';
import { ENV } from '../config/environments.js';

// Default request params
const defaultParams = {
  timeout: '10s',
  insecureSkipTLSVerify: ENV.insecureSkipTLSVerify,
};

/**
 * GET request with basic response check
 */
export function get(url, name, params = {}) {
  const res = http.get(url, {
    ...defaultParams,
    ...params,
    tags: { name, ...params.tags },
  });

  const ok = check(res, {
    [`${name} status OK`]: (r) => r.status >= 200 && r.status < 400,
  });

  return { response: res, ok };
}

/**
 * POST JSON request
 */
export function postJson(url, body, name, params = {}) {
  const res = http.post(url, JSON.stringify(body), {
    ...defaultParams,
    ...params,
    headers: {
      'Content-Type': 'application/json',
      ...params.headers,
    },
    tags: { name, ...params.tags },
  });

  const ok = check(res, {
    [`${name} status OK`]: (r) => r.status >= 200 && r.status < 400,
  });

  return { response: res, ok };
}

/**
 * Health check - GET with relaxed success criteria
 */
export function healthCheck(url, name) {
  const res = http.get(url, {
    ...defaultParams,
    tags: { name, type: 'health' },
  });

  const responds = check(res, {
    [`${name} responds`]: (r) => r.status > 0,
  });

  const healthy = check(res, {
    [`${name} healthy`]: (r) => r.status >= 200 && r.status < 400,
  });

  return { response: res, ok: responds, healthy };
}

/**
 * Check response time against threshold
 */
export function checkDuration(response, name, maxMs) {
  return check(response, {
    [`${name} duration < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
}

/**
 * Check JSON response has expected field
 */
export function checkHasField(response, name, field) {
  return check(response, {
    [`${name} has ${field}`]: (r) => {
      try {
        return r.json(field) !== undefined;
      } catch {
        return false;
      }
    },
  });
}