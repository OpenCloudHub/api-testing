// helpers/data.js
// Test data loading utilities

import { SharedArray } from 'k6/data';

/**
 * Load JSON data file using SharedArray (efficient for multiple VUs)
 * @param {string} name - Unique name for the shared array
 * @param {string} path - Path relative to test file (e.g., '../../data/wine.json')
 * @returns {array}
 */
export function loadJsonData(name, path) {
  return new SharedArray(name, function () {
    try {
      const data = JSON.parse(open(path));
      const items = Array.isArray(data) ? data : [data];
      console.log(`✅ Loaded ${items.length} ${name} sample(s)`);
      return items;
    } catch (e) {
      console.error(`❌ Failed to load ${path}: ${e.message}`);
      return [];
    }
  });
}

/**
 * Get random sample from array
 * @param {array} data
 * @returns {*}
 */
export function randomSample(data) {
  if (!data || data.length === 0) {
    throw new Error('Data array is empty');
  }
  return data[Math.floor(Math.random() * data.length)];
}

/**
 * Get sequential sample (wraps around) - useful for deterministic tests
 * @param {array} data
 * @param {number} index - Iteration index
 * @returns {*}
 */
export function sequentialSample(data, index) {
  if (!data || data.length === 0) {
    throw new Error('Data array is empty');
  }
  return data[index % data.length];
}