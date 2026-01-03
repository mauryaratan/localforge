import { stringify as yamlStringify, parse as yamlParse } from "yaml";

export type ConversionResult = {
  success: boolean;
  output: string;
  error?: string;
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
  parsed?: unknown;
};

export type JsonValidationResult = ValidationResult;

/**
 * Validates JSON string and returns parsed result
 */
export const validateJson = (jsonString: string): JsonValidationResult => {
  if (!jsonString.trim()) {
    return { isValid: false, error: "Please enter JSON" };
  }

  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, parsed };
  } catch (e) {
    const error = e instanceof SyntaxError ? e.message : "Invalid JSON";
    return { isValid: false, error };
  }
};

/**
 * Converts JSON string to YAML
 */
export const jsonToYaml = (jsonString: string): ConversionResult => {
  const validation = validateJson(jsonString);

  if (!validation.isValid) {
    return { success: false, output: "", error: validation.error };
  }

  try {
    const yaml = yamlStringify(validation.parsed, {
      indent: 2,
      lineWidth: 0, // Disable line wrapping
      nullStr: "null",
    });
    return { success: true, output: yaml };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Conversion failed";
    return { success: false, output: "", error };
  }
};

/**
 * Validates YAML string and returns parsed result
 */
export const validateYaml = (yamlString: string): ValidationResult => {
  if (!yamlString.trim()) {
    return { isValid: false, error: "Please enter YAML" };
  }

  try {
    const parsed = yamlParse(yamlString);
    return { isValid: true, parsed };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Invalid YAML";
    return { isValid: false, error };
  }
};

/**
 * Converts YAML string to JSON
 */
export const yamlToJson = (
  yamlString: string,
  pretty = true
): ConversionResult => {
  const validation = validateYaml(yamlString);

  if (!validation.isValid) {
    return { success: false, output: "", error: validation.error };
  }

  try {
    const json = pretty
      ? JSON.stringify(validation.parsed, null, 2)
      : JSON.stringify(validation.parsed);
    return { success: true, output: json };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Conversion failed";
    return { success: false, output: "", error };
  }
};

/**
 * Formats/prettifies JSON string
 */
export const formatJson = (jsonString: string): ConversionResult => {
  const validation = validateJson(jsonString);

  if (!validation.isValid) {
    return { success: false, output: "", error: validation.error };
  }

  try {
    const formatted = JSON.stringify(validation.parsed, null, 2);
    return { success: true, output: formatted };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Formatting failed";
    return { success: false, output: "", error };
  }
};

/**
 * Minifies JSON string
 */
export const minifyJson = (jsonString: string): ConversionResult => {
  const validation = validateJson(jsonString);

  if (!validation.isValid) {
    return { success: false, output: "", error: validation.error };
  }

  try {
    const minified = JSON.stringify(validation.parsed);
    return { success: true, output: minified };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Minification failed";
    return { success: false, output: "", error };
  }
};

export const exampleJson = {
  simple: `{
  "name": "John Doe",
  "age": 30,
  "active": true
}`,
  nested: `{
  "user": {
    "id": 1,
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    }
  },
  "settings": {
    "theme": "dark",
    "notifications": true
  }
}`,
  array: `{
  "fruits": ["apple", "banana", "orange"],
  "prices": [1.50, 2.00, 1.75],
  "mixed": [1, "two", true, null]
}`,
  complex: `{
  "apiVersion": "v1",
  "kind": "ConfigMap",
  "metadata": {
    "name": "app-config",
    "namespace": "production",
    "labels": {
      "app": "myapp",
      "environment": "prod"
    }
  },
  "data": {
    "DATABASE_URL": "postgres://localhost:5432/db",
    "API_KEY": "secret-key-123",
    "MAX_CONNECTIONS": "100"
  }
}`,
};

export const exampleYaml = {
  simple: `name: John Doe
age: 30
active: true`,
  nested: `user:
  id: 1
  profile:
    firstName: Jane
    lastName: Smith
    email: jane@example.com
settings:
  theme: dark
  notifications: true`,
  array: `fruits:
  - apple
  - banana
  - orange
prices:
  - 1.5
  - 2
  - 1.75
mixed:
  - 1
  - two
  - true
  - null`,
  complex: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
  labels:
    app: myapp
    environment: prod
data:
  DATABASE_URL: postgres://localhost:5432/db
  API_KEY: secret-key-123
  MAX_CONNECTIONS: "100"`,
};
