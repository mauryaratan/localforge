export interface CronField {
  name: string;
  value: string;
  description: string;
  min: number;
  max: number;
  valid: boolean;
  error?: string;
}

export interface ParsedCron {
  isValid: boolean;
  error?: string;
  expression: string;
  fields: CronField[];
  description: string;
  nextRuns: Date[];
}

interface FieldConfig {
  name: string;
  min: number;
  max: number;
  names?: string[];
}

const FIELD_CONFIGS: FieldConfig[] = [
  { name: "Minute", min: 0, max: 59 },
  { name: "Hour", min: 0, max: 23 },
  { name: "Day of Month", min: 1, max: 31 },
  {
    name: "Month",
    min: 1,
    max: 12,
    names: [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ],
  },
  {
    name: "Day of Week",
    min: 0,
    max: 6,
    names: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  },
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const WHITESPACE_REGEX = /\s+/;

/**
 * Convert named values to numbers (e.g., JAN -> 1, MON -> 1)
 */
const convertNamedValue = (value: string, config: FieldConfig): string => {
  if (!config.names) {
    return value;
  }

  const upper = value.toUpperCase();
  const index = config.names.indexOf(upper);

  if (index !== -1) {
    return config.name === "Day of Week" ? String(index) : String(index + 1);
  }

  return value;
};

/**
 * Parse a single cron field value and validate it
 */
const parseFieldValue = (
  value: string,
  config: FieldConfig
): { values: number[]; error?: string } => {
  const values: number[] = [];
  const parts = value.split(",");

  for (const part of parts) {
    const trimmed = part.trim();

    // Handle wildcard
    if (trimmed === "*") {
      for (let i = config.min; i <= config.max; i++) {
        values.push(i);
      }
      continue;
    }

    // Handle step values (*/n or start-end/n)
    if (trimmed.includes("/")) {
      const [range, stepStr] = trimmed.split("/");
      const step = Number.parseInt(stepStr, 10);

      if (Number.isNaN(step) || step <= 0) {
        return { values: [], error: `Invalid step value: ${stepStr}` };
      }

      let start = config.min;
      let end = config.max;

      if (range !== "*") {
        if (range.includes("-")) {
          const [s, e] = range
            .split("-")
            .map((v) => Number.parseInt(convertNamedValue(v, config), 10));
          start = s;
          end = e;
        } else {
          start = Number.parseInt(convertNamedValue(range, config), 10);
        }
      }

      if (Number.isNaN(start) || Number.isNaN(end)) {
        return { values: [], error: `Invalid range: ${range}` };
      }

      for (let i = start; i <= end; i += step) {
        values.push(i);
      }
      continue;
    }

    // Handle range (n-m)
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = Number.parseInt(convertNamedValue(startStr, config), 10);
      const end = Number.parseInt(convertNamedValue(endStr, config), 10);

      if (Number.isNaN(start) || Number.isNaN(end)) {
        return { values: [], error: `Invalid range: ${trimmed}` };
      }

      if (start > end) {
        return {
          values: [],
          error: `Invalid range: start (${start}) > end (${end})`,
        };
      }

      for (let i = start; i <= end; i++) {
        values.push(i);
      }
      continue;
    }

    // Handle single value
    const num = Number.parseInt(convertNamedValue(trimmed, config), 10);
    if (Number.isNaN(num)) {
      return { values: [], error: `Invalid value: ${trimmed}` };
    }

    if (num < config.min || num > config.max) {
      return {
        values: [],
        error: `Value ${num} out of range (${config.min}-${config.max})`,
      };
    }

    values.push(num);
  }

  return { values: [...new Set(values)].sort((a, b) => a - b) };
};

/**
 * Generate a human-readable description for a field
 */
const describeField = (value: string, config: FieldConfig): string => {
  if (value === "*") {
    return `every ${config.name.toLowerCase()}`;
  }

  const { values, error } = parseFieldValue(value, config);

  if (error || values.length === 0) {
    return "invalid";
  }

  // Check if it's a step pattern
  if (value.includes("/")) {
    const step = value.split("/")[1];
    if (value.startsWith("*")) {
      return `every ${step} ${config.name.toLowerCase()}${Number.parseInt(step, 10) > 1 ? "s" : ""}`;
    }
  }

  // Format values based on field type
  const formatValue = (v: number): string => {
    if (config.name === "Month") {
      return MONTH_NAMES[v - 1] || String(v);
    }
    if (config.name === "Day of Week") {
      return DAY_NAMES[v] || String(v);
    }
    return String(v);
  };

  if (values.length === 1) {
    return formatValue(values[0]);
  }

  if (values.length === config.max - config.min + 1) {
    return `every ${config.name.toLowerCase()}`;
  }

  // Check for consecutive range
  const isConsecutive = values.every(
    (v, i) => i === 0 || v === values[i - 1] + 1
  );
  if (isConsecutive && values.length > 2) {
    return `${formatValue(values[0])} through ${formatValue(values.at(-1))}`;
  }

  return values.map(formatValue).join(", ");
};

/**
 * Generate a complete human-readable description for a cron expression
 */
const generateDescription = (fields: CronField[]): string => {
  if (fields.length !== 5 || !fields.every((f) => f.valid)) {
    return "Invalid expression";
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;
  const parts: string[] = [];

  // Time description
  if (minute.value === "*" && hour.value === "*") {
    parts.push("Every minute");
  } else if (minute.value === "0" && hour.value === "*") {
    parts.push("Every hour");
  } else if (minute.value.includes("/") && minute.value.startsWith("*")) {
    const step = minute.value.split("/")[1];
    parts.push(`Every ${step} minutes`);
  } else if (hour.value.includes("/") && hour.value.startsWith("*")) {
    const step = hour.value.split("/")[1];
    parts.push(`Every ${step} hours`);
  } else {
    const minParsed = parseFieldValue(minute.value, FIELD_CONFIGS[0]);
    const hourParsed = parseFieldValue(hour.value, FIELD_CONFIGS[1]);

    if (minParsed.values.length === 1 && hourParsed.values.length === 1) {
      const h = hourParsed.values[0];
      const m = minParsed.values[0];
      const period = h >= 12 ? "PM" : "AM";
      let displayHour = h;
      if (h === 0) {
        displayHour = 12;
      } else if (h > 12) {
        displayHour = h - 12;
      }
      parts.push(
        `At ${displayHour}:${m.toString().padStart(2, "0")} ${period}`
      );
    } else if (minParsed.values.length === 1) {
      parts.push(`At minute ${minParsed.values[0]}`);
      if (hour.value !== "*") {
        parts.push(`past hour ${hour.description}`);
      }
    } else {
      parts.push(`At minutes ${minute.description}`);
      if (hour.value !== "*") {
        parts.push(`past hour ${hour.description}`);
      }
    }
  }

  // Day/Month description
  const hasDayConstraint = dayOfMonth.value !== "*";
  const hasMonthConstraint = month.value !== "*";
  const hasDayOfWeekConstraint = dayOfWeek.value !== "*";

  if (hasDayOfWeekConstraint && !hasDayConstraint) {
    parts.push(`on ${dayOfWeek.description}`);
  } else if (hasDayConstraint) {
    parts.push(`on day ${dayOfMonth.description}`);
    if (hasDayOfWeekConstraint) {
      parts.push(`and on ${dayOfWeek.description}`);
    }
  }

  if (hasMonthConstraint) {
    parts.push(`in ${month.description}`);
  }

  return parts.join(" ");
};

/**
 * Calculate the next N run times for a cron expression
 */
const calculateNextRuns = (fields: CronField[], count = 5): Date[] => {
  if (!fields.every((f) => f.valid)) {
    return [];
  }

  const runs: Date[] = [];
  const now = new Date();
  const current = new Date(now);
  current.setSeconds(0, 0);

  const minuteVals = parseFieldValue(fields[0].value, FIELD_CONFIGS[0]).values;
  const hourVals = parseFieldValue(fields[1].value, FIELD_CONFIGS[1]).values;
  const dayOfMonthVals = parseFieldValue(
    fields[2].value,
    FIELD_CONFIGS[2]
  ).values;
  const monthVals = parseFieldValue(fields[3].value, FIELD_CONFIGS[3]).values;
  const dayOfWeekVals = parseFieldValue(
    fields[4].value,
    FIELD_CONFIGS[4]
  ).values;

  const matchesCron = (date: Date): boolean => {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    return (
      minuteVals.includes(minute) &&
      hourVals.includes(hour) &&
      monthVals.includes(month) &&
      (dayOfMonthVals.includes(dayOfMonth) || dayOfWeekVals.includes(dayOfWeek))
    );
  };

  // Search for next runs (limit iterations to prevent infinite loops)
  const maxIterations = 525_600; // ~1 year in minutes
  let iterations = 0;

  while (runs.length < count && iterations < maxIterations) {
    current.setMinutes(current.getMinutes() + 1);
    iterations++;

    if (matchesCron(current)) {
      runs.push(new Date(current));
    }
  }

  return runs;
};

/**
 * Parse a cron expression and return structured data
 */
export const parseCron = (expression: string): ParsedCron => {
  const emptyResult: ParsedCron = {
    isValid: false,
    error: "",
    expression: "",
    fields: [],
    description: "",
    nextRuns: [],
  };

  if (!expression.trim()) {
    return { ...emptyResult, error: "Please enter a cron expression" };
  }

  const parts = expression.trim().split(WHITESPACE_REGEX);

  if (parts.length !== 5) {
    return {
      ...emptyResult,
      expression,
      error: `Expected 5 fields, got ${parts.length}. Format: minute hour day-of-month month day-of-week`,
    };
  }

  const fields: CronField[] = parts.map((value, index) => {
    const config = FIELD_CONFIGS[index];
    const { error } = parseFieldValue(value, config);
    const description = describeField(value, config);

    return {
      name: config.name,
      value,
      description,
      min: config.min,
      max: config.max,
      valid: !error,
      error,
    };
  });

  const allValid = fields.every((f) => f.valid);

  return {
    isValid: allValid,
    expression,
    fields,
    description: allValid ? generateDescription(fields) : "Invalid expression",
    nextRuns: allValid ? calculateNextRuns(fields, 5) : [],
    error: allValid ? undefined : fields.find((f) => !f.valid)?.error,
  };
};

/**
 * Common cron expression examples
 */
export interface CronExample {
  expression: string;
  label: string;
  description: string;
}

export const CRON_EXAMPLES: CronExample[] = [
  {
    expression: "* * * * *",
    label: "Every Minute",
    description: "Runs every minute of every day",
  },
  {
    expression: "0 * * * *",
    label: "Every Hour",
    description: "Runs at the start of every hour",
  },
  {
    expression: "0 0 * * *",
    label: "Daily at Midnight",
    description: "Runs once a day at 00:00",
  },
  {
    expression: "0 9 * * 1-5",
    label: "Weekdays at 9 AM",
    description: "Runs at 9 AM Monday through Friday",
  },
  {
    expression: "0 0 * * 0",
    label: "Weekly on Sunday",
    description: "Runs every Sunday at midnight",
  },
  {
    expression: "0 0 1 * *",
    label: "Monthly (1st)",
    description: "Runs on the 1st of every month",
  },
  {
    expression: "0 0 1 1 *",
    label: "Yearly (Jan 1)",
    description: "Runs once a year on January 1st",
  },
  {
    expression: "*/15 * * * *",
    label: "Every 15 Minutes",
    description: "Runs every 15 minutes",
  },
  {
    expression: "0 */2 * * *",
    label: "Every 2 Hours",
    description: "Runs every 2 hours on the hour",
  },
  {
    expression: "30 4 1,15 * *",
    label: "1st & 15th at 4:30 AM",
    description: "Runs at 4:30 AM on the 1st and 15th",
  },
  {
    expression: "0 22 * * 1-5",
    label: "Weekdays at 10 PM",
    description: "Runs at 10 PM Monday through Friday",
  },
  {
    expression: "0 0 * * 6,0",
    label: "Weekends at Midnight",
    description: "Runs at midnight on Saturday and Sunday",
  },
];

/**
 * Format a date for display
 */
export const formatNextRun = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
};
