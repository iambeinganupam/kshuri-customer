// Lightweight feature-flag reader. Reads from environment variables that are
// resolved at build/run time. Use this for ALL R1 rollout gates so a single
// flag flip in env can be inspected and audited.
//
// Convention: every R-slice gets its own boolean env var prefixed with the
// slice id (e.g. R1_DISCOVERY_V2, R2_BOOKING_FLOW_V1).

const FLAGS = {
  R1_DISCOVERY_V2: 'NEXT_PUBLIC_R1_DISCOVERY_V2',
} as const;

export type FlagName = keyof typeof FLAGS;

export function getFlag(name: FlagName): boolean {
  const envKey = FLAGS[name];
  const raw = process.env[envKey];
  return raw === 'true' || raw === '1';
}
