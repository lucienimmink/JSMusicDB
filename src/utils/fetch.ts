export async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const { timeout = 1500, ...requestOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(resource, {
      ...requestOptions,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const sleep = (milliseconds: number | undefined) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
