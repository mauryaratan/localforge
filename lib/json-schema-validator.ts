import Ajv, {
  type AnySchema,
  type ErrorObject,
  type ValidateFunction,
} from "ajv";

export interface SchemaValidationIssue {
  keyword: string;
  message: string;
  params: Record<string, unknown>;
  path: string;
  schemaPath: string;
}

export interface JsonSchemaValidationResult {
  data?: unknown;
  error?: string;
  issues: SchemaValidationIssue[];
  schema?: unknown;
  valid: boolean;
}

export const schemaExamples = {
  data: JSON.stringify(
    {
      email: "ram@example.com",
      id: 42,
      roles: ["admin", "developer"],
    },
    null,
    2
  ),
  schema: JSON.stringify(
    {
      type: "object",
      required: ["id", "email", "roles"],
      properties: {
        id: { type: "integer", minimum: 1 },
        email: { type: "string", pattern: "^[^@]+@[^@]+\\.[^@]+$" },
        roles: {
          type: "array",
          minItems: 1,
          items: { type: "string" },
        },
      },
      additionalProperties: false,
    },
    null,
    2
  ),
};

const parseJson = (
  input: string,
  label: string
): { value?: unknown; error?: string } => {
  try {
    return { value: JSON.parse(input) };
  } catch (error) {
    return {
      error: `${label} is not valid JSON: ${
        error instanceof Error ? error.message : "Unknown parse error"
      }`,
    };
  }
};

const formatPath = (error: ErrorObject): string => {
  if (error.instancePath) {
    return error.instancePath;
  }
  const missingProperty = (error.params as { missingProperty?: string })
    .missingProperty;
  return missingProperty ? `/${missingProperty}` : "/";
};

const formatIssues = (errors: ErrorObject[] | null | undefined) =>
  (errors ?? []).map((error) => ({
    keyword: error.keyword,
    message: error.message ?? "Schema validation failed",
    params: error.params as Record<string, unknown>,
    path: formatPath(error),
    schemaPath: error.schemaPath,
  }));

export const validateJsonAgainstSchema = (
  dataInput: string,
  schemaInput: string
): JsonSchemaValidationResult => {
  if (!(dataInput.trim() && schemaInput.trim())) {
    return {
      error: "Paste both JSON data and a JSON Schema",
      issues: [],
      valid: false,
    };
  }

  const dataResult = parseJson(dataInput, "Data");
  if (dataResult.error) {
    return { error: dataResult.error, issues: [], valid: false };
  }

  const schemaResult = parseJson(schemaInput, "Schema");
  if (schemaResult.error) {
    return { error: schemaResult.error, issues: [], valid: false };
  }

  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateSchema: true,
  });

  let validate: ValidateFunction;
  try {
    validate = ajv.compile(schemaResult.value as AnySchema);
  } catch (error) {
    return {
      data: dataResult.value,
      error: `Schema is invalid: ${
        error instanceof Error ? error.message : "Unknown schema error"
      }`,
      issues: [],
      schema: schemaResult.value,
      valid: false,
    };
  }

  const valid = Boolean(validate(dataResult.value));

  return {
    data: dataResult.value,
    error: valid ? undefined : "Data does not match the schema",
    issues: formatIssues(validate.errors),
    schema: schemaResult.value,
    valid,
  };
};
