export const RESPONSE_DURATION = 5000

export function createResponse(type, data) {
  return {
    id: crypto.randomUUID(),
    type,
    data,
    createdAt: Date.now()
  }
}
