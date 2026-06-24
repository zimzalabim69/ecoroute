import { NextResponse } from "next/server";

/**
 * Standardizes error response formatting for API route handlers.
 *
 * @param err - The thrown error value (unknown to keep the call sites safe).
 * @param status - HTTP status code to return. Defaults to 500.
 * @returns A NextResponse containing `{ error: <message> }`.
 */
export function handleApiError(err: unknown, status = 500): NextResponse {
  const message = err instanceof Error ? err.message : "Unknown error";
  return NextResponse.json({ error: message }, { status });
}

/**
 * Checks a map of required fields and returns the first field whose value is
 * missing or empty.
 *
 * A field is considered missing when its value is `null`, `undefined`, or an
 * empty string. All other values (including `0` and `false`) are treated as
 * present.
 *
 * @param fields - Object mapping field names to their values.
 * @returns The name of the first missing field, or `null` if all are present.
 */
export function validateRequired(fields: Record<string, unknown>): string | null {
  for (const [name, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === "") {
      return name;
    }
  }
  return null;
}
