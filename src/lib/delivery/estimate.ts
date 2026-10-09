/**
 * Delivery Date Calculation Engine (Pure Function)
 * 
 * Conventions:
 * - A working day for an origin is Monday to Friday and not in that origin's holiday calendar.
 * - A transit working day is Monday to Friday (or Saturday if delivers_saturday is enabled)
 *   and not in the destination country's holiday calendar.
 * - The dispatch day is "day 0". Transit day 1 is the next transit working day.
 * - displayDate is always latestDate (the safe promise).
 */

import {
  DeliveryRule,
  CountryGroup,
  HolidayEntry,
  EstimateDeliveryInput,
  EstimateDeliveryResult,
  OriginId
} from './types';
import { DEFAULT_COUNTRY_GROUPS } from './defaults';

export const ORIGIN_TIMEZONES: Record<OriginId, string> = {
  GENEVA: 'Europe/Zurich',
  PORTUGAL: 'Europe/Lisbon'
};

export const DEFAULT_CUTOFFS: Record<OriginId, string> = {
  GENEVA: '14:00',
  PORTUGAL: '14:00'
};

export const DEFAULT_HANDLING: Record<OriginId, number> = {
  GENEVA: 0,
  PORTUGAL: 0
};

interface ZonedDateParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  dateString: string; // "YYYY-MM-DD"
}

/**
 * Extracts date parts of a JS Date in a given IANA timezone.
 */
export function getZonedParts(date: Date, timeZone: string): ZonedDateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  let year = 1970;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let weekdayStr = 'Sun';

  for (const p of parts) {
    if (p.type === 'year') year = parseInt(p.value, 10);
    else if (p.type === 'month') month = parseInt(p.value, 10);
    else if (p.type === 'day') day = parseInt(p.value, 10);
    else if (p.type === 'hour') hour = parseInt(p.value, 10) === 24 ? 0 : parseInt(p.value, 10);
    else if (p.type === 'minute') minute = parseInt(p.value, 10);
    else if (p.type === 'weekday') weekdayStr = p.value;
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = Math.max(0, weekdays.indexOf(weekdayStr));
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const dateString = `${year}-${monthStr}-${dayStr}`;

  return { year, month, day, hour, minute, dayOfWeek, dateString };
}

/**
 * Parses YYYY-MM-DD into a localized UTC-normalized Date object.
 */
export function parseDateString(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/**
 * Formats a Date object as YYYY-MM-DD in UTC.
 */
export function formatDateString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
}

/**
 * Adds N calendar days to a Date object in UTC.
 */
export function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

/**
 * Checks if a given date string is a working day for an origin.
 */
export function isOriginWorkingDay(
  dateStr: string,
  origin: OriginId,
  holidays: HolidayEntry[] = []
): boolean {
  const date = parseDateString(dateStr);
  const dayOfWeek = date.getUTCDay(); // 0=Sun, 6=Sat
  // Operating schedule: 6 days a week (Mon-Sat), only Sunday is a holiday
  if (dayOfWeek === 0) return false;

  const originCal = origin;
  const countryCal = origin === 'GENEVA' ? 'CH' : 'PT';

  const isHoliday = holidays.some(
    h => (h.calendar === originCal || h.calendar === countryCal) && h.date === dateStr
  );
  return !isHoliday;
}

/**
 * Checks if a given date string is a transit working day for destination country.
 */
export function isTransitWorkingDay(
  dateStr: string,
  destinationCountry: string,
  deliversSaturday: boolean = true,
  holidays: HolidayEntry[] = []
): boolean {
  const date = parseDateString(dateStr);
  const dayOfWeek = date.getUTCDay(); // 0=Sun, 6=Sat

  if (dayOfWeek === 0) return false; // Sunday never transit
  if (dayOfWeek === 6 && !deliversSaturday) return false;

  const isHoliday = holidays.some(
    h => h.calendar === destinationCountry && h.date === dateStr
  );
  return !isHoliday;
}

/**
 * Finds the next origin working day starting from a given date.
 */
export function getNextOriginWorkingDay(
  startDateStr: string,
  origin: OriginId,
  holidays: HolidayEntry[] = []
): string {
  let curr = parseDateString(startDateStr);
  while (true) {
    curr = addDays(curr, 1);
    const currStr = formatDateString(curr);
    if (isOriginWorkingDay(currStr, origin, holidays)) {
      return currStr;
    }
  }
}

/**
 * Finds matching delivery rule per lookup priority:
 * 1. exact (origin, country, shipping_method)
 * 2. (origin, country, method = null)
 * 3. (origin, country_group)
 * 4. none -> blocked
 */
export function findMatchingDeliveryRule(
  origin: OriginId,
  destinationCountry: string,
  shippingMethod: string | null | undefined,
  rules: DeliveryRule[],
  countryGroups: CountryGroup[] = DEFAULT_COUNTRY_GROUPS
): { rule: DeliveryRule | null; matchType?: 'exact' | 'default_method' | 'country_group' } {
  const destUpper = destinationCountry.toUpperCase().trim();
  const methodNorm = shippingMethod ? shippingMethod.trim() : null;

  // 1. Exact match (origin, country, method)
  if (methodNorm) {
    const exact = rules.find(
      r =>
        r.is_active &&
        r.origin === origin &&
        r.country_code?.toUpperCase() === destUpper &&
        r.shipping_method === methodNorm
    );
    if (exact) return { rule: exact, matchType: 'exact' };
  }

  // 2. Default method match (origin, country, method = null)
  const defaultMethod = rules.find(
    r =>
      r.is_active &&
      r.origin === origin &&
      r.country_code?.toUpperCase() === destUpper &&
      (!r.shipping_method || r.shipping_method === '')
  );
  if (defaultMethod) return { rule: defaultMethod, matchType: 'default_method' };

  // 3. Country group match (origin, country_group)
  for (const group of countryGroups) {
    if (group.countries.includes(destUpper)) {
      const groupRule = rules.find(
        r =>
          r.is_active &&
          r.origin === origin &&
          r.country_group === group.code &&
          (!r.shipping_method || r.shipping_method === methodNorm)
      );
      if (groupRule) return { rule: groupRule, matchType: 'country_group' };
    }
  }

  // 4. None -> blocked
  return { rule: null };
}

/**
 * Main Pure Delivery Date Estimation Function
 */
export function estimateDelivery(input: EstimateDeliveryInput): EstimateDeliveryResult {
  const {
    origin,
    destinationCountry,
    shippingMethod = null,
    now = new Date(),
    rules,
    holidays = [],
    settings = { extra_delay_days: 0 },
    countryGroups = DEFAULT_COUNTRY_GROUPS
  } = input;

  const destCountry = destinationCountry.toUpperCase().trim();
  const originTz = ORIGIN_TIMEZONES[origin] || 'Europe/Zurich';

  // Rule lookup
  const { rule, matchType } = findMatchingDeliveryRule(
    origin,
    destCountry,
    shippingMethod,
    rules,
    countryGroups
  );

  if (!rule || !rule.is_allowed) {
    return {
      isAllowed: false,
      blockReason: rule ? 'COUNTRY_NOT_SUPPORTED' : 'NO_ACTIVE_RULE',
      origin,
      destinationCountry: destCountry,
      shippingMethod,
      dispatchDate: '',
      earliestDate: '',
      latestDate: '',
      displayDate: '',
      cutoffPassed: false,
      requiresCustoms: false,
      deliversSaturday: false,
      handlingDays: 0,
      transitMinDays: 0,
      transitMaxDays: 0,
      orderByTime: null
    };
  }

  // Step 1: Convert `now` to origin's timezone
  const zoned = getZonedParts(now, originTz);
  const cutoffTime = rule.cutoff_time || DEFAULT_CUTOFFS[origin];
  const [cutoffH, cutoffM] = cutoffTime.split(':').map(Number);

  // Step 2: Determine Candidate Dispatch Day
  const isTodayWorking = isOriginWorkingDay(zoned.dateString, origin, holidays);
  const nowMinutes = zoned.hour * 60 + zoned.minute;
  const cutoffMinutes = cutoffH * 60 + cutoffM;
  const isBeforeCutoff = isTodayWorking && nowMinutes < cutoffMinutes;

  let candidateDateStr: string;
  let cutoffPassed: boolean;
  let orderByTime: EstimateDeliveryResult['orderByTime'] = null;

  if (isBeforeCutoff) {
    candidateDateStr = zoned.dateString;
    cutoffPassed = false;
    const diff = cutoffMinutes - nowMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    orderByTime = {
      hours,
      minutes,
      formatted: hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`
    };
  } else {
    candidateDateStr = getNextOriginWorkingDay(zoned.dateString, origin, holidays);
    cutoffPassed = true;
  }

  // Step 3: Add handling_days (origin working days)
  const handlingDays = rule.handling_days !== undefined ? rule.handling_days : DEFAULT_HANDLING[origin];
  let dispatchDateStr = candidateDateStr;

  if (handlingDays > 0) {
    for (let i = 0; i < handlingDays; i++) {
      dispatchDateStr = getNextOriginWorkingDay(dispatchDateStr, origin, holidays);
    }
  }

  // Step 4 & 5 & 6: Transit days calculation
  // Dispatch day is day 0. Transit day 1 is the next transit working day.
  const customsBuffer = rule.requires_customs ? (rule.customs_buffer_days || 0) : 0;
  const extraDelay = Math.max(0, settings.extra_delay_days || 0);

  const minTransitTarget = rule.transit_min_days + Math.floor(customsBuffer / 2) + extraDelay;
  const maxTransitTarget = rule.transit_max_days + customsBuffer + extraDelay;

  let earliestDateStr = dispatchDateStr;
  let latestDateStr = dispatchDateStr;

  let currentTransitDate = parseDateString(dispatchDateStr);
  let transitCount = 0;

  // Maximum safe boundary of 60 calendar days to prevent infinite loops
  for (let d = 1; d <= 60; d++) {
    currentTransitDate = addDays(currentTransitDate, 1);
    const checkStr = formatDateString(currentTransitDate);

    if (isTransitWorkingDay(checkStr, destCountry, rule.delivers_saturday, holidays)) {
      transitCount++;

      if (transitCount === minTransitTarget && !earliestDateStr) {
        earliestDateStr = checkStr;
      }
      if (transitCount === Math.max(1, minTransitTarget)) {
        earliestDateStr = checkStr;
      }
      if (transitCount >= maxTransitTarget) {
        latestDateStr = checkStr;
        break;
      }
    }
  }

  // If earliest date wasn't set, default to latest date
  if (!earliestDateStr) earliestDateStr = latestDateStr;

  // Step 7: displayDate = latestDate (the safe promise)
  const displayDateStr = latestDateStr;

  return {
    isAllowed: true,
    origin,
    destinationCountry: destCountry,
    shippingMethod,
    dispatchDate: dispatchDateStr,
    earliestDate: earliestDateStr,
    latestDate: latestDateStr,
    displayDate: displayDateStr,
    cutoffPassed,
    requiresCustoms: rule.requires_customs,
    deliversSaturday: rule.delivers_saturday,
    handlingDays,
    transitMinDays: rule.transit_min_days,
    transitMaxDays: rule.transit_max_days,
    orderByTime,
    ruleMatched: {
      type: matchType || 'exact',
      ruleId: rule.id
    }
  };
}
