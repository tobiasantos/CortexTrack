/**
 * Compute start and end of a local day in UTC, adjusted by client timezone offset.
 * @param {string} dateStr - Date in YYYY-MM-DD format (represents a local calendar day)
 * @param {number} tzOffset - Client's timezone offset in minutes (from Date.getTimezoneOffset())
 *                            e.g. BRT (UTC-3) = 180, EST (UTC-5) = 300
 * @returns {{ start: Date, end: Date }}
 */
function dayBounds(dateStr, tzOffset = 0) {
  const offset = parseInt(tzOffset) || 0;
  const baseStart = new Date(`${dateStr}T00:00:00.000Z`);
  const baseEnd = new Date(`${dateStr}T23:59:59.999Z`);

  return {
    start: new Date(baseStart.getTime() + offset * 60000),
    end: new Date(baseEnd.getTime() + offset * 60000),
  };
}

module.exports = { dayBounds };
