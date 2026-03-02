/**
 * Calculate the mean of an array of numbers.
 */
function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate the standard deviation of an array of numbers.
 */
function stddev(values) {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Calculate the Z-score of a value relative to a dataset.
 */
function zScore(value, values) {
  const sd = stddev(values);
  if (sd === 0) return 0;
  return (value - mean(values)) / sd;
}

/**
 * Simple moving average over a window.
 */
function movingAverage(values, window) {
  if (values.length <= window) return mean(values);
  const recent = values.slice(-window);
  return mean(recent);
}

/**
 * Clamp a number between min and max.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

module.exports = { mean, stddev, zScore, movingAverage, clamp };
