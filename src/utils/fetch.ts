export async function fetchWithTimeout(resource: string, options = {}) {
  //@ts-ignore
  const { timeout = 1500 } = options; // default timeout after 1s

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}
