export function generateUniqueId(prefix = 'test'): string {
  return `${prefix}-${Date.now()}`;
}

export async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
