/**
 * Runtime environment validation.
 * Call this at app startup to fail fast with a clear message.
 */

export interface EnvCheck {
  name: string;
  value: string | undefined;
  required: boolean;
  isPlaceholder: boolean;
}

export function checkEnv(): { ok: boolean; missing: string[]; placeholders: string[] } {
  const checks: EnvCheck[] = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL, required: true, isPlaceholder: false },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, required: true, isPlaceholder: true },
    { name: "ORS_API_KEY", value: process.env.ORS_API_KEY, required: true, isPlaceholder: true },
    { name: "OCM_API_KEY", value: process.env.OCM_API_KEY, required: false, isPlaceholder: true },
    { name: "STRIPE_SECRET_KEY", value: process.env.STRIPE_SECRET_KEY, required: false, isPlaceholder: true },
    { name: "STRIPE_WEBHOOK_SECRET", value: process.env.STRIPE_WEBHOOK_SECRET, required: false, isPlaceholder: true },
  ];

  const missing: string[] = [];
  const placeholders: string[] = [];

  for (const check of checks) {
    if (!check.value) {
      if (check.required) missing.push(check.name);
      continue;
    }
    if (check.isPlaceholder && isPlaceholderValue(check.value)) {
      placeholders.push(check.name);
    }
  }

  return { ok: missing.length === 0 && placeholders.length === 0, missing, placeholders };
}

function isPlaceholderValue(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.includes("your") ||
    lower.includes("placeholder") ||
    lower === "test"
  );
}

export function formatEnvWarnings(missing: string[], placeholders: string[]): string {
  const lines: string[] = [];
  if (missing.length > 0) {
    lines.push(`Missing required env vars: ${missing.join(", ")}`);
  }
  if (placeholders.length > 0) {
    lines.push(`Placeholder values detected (features will be stubbed): ${placeholders.join(", ")}`);
  }
  return lines.join(" | ");
}
