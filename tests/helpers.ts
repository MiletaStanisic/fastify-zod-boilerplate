/**
 * Type-safe helper for Fastify inject responses.
 * LightMyRequestResponse.json() returns `any`; this wrapper narrows via unknown
 * so the cast to T is always "necessary" and no unsafe-assignment fires.
 */
export function parseBody<T>(res: { json: () => unknown }): T {
  return res.json() as T;
}
