export function colorFromId(id: string): string {
  let hash = 0;

  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return `hsl(${hash % 360} 82% 62%)`;
}

export function createDeviceId(): string {
  const chunk = Math.random().toString(36).slice(2, 8);
  return `device_${chunk}`;
}

export function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const map = new Map<string, T>();

  for (const item of items) {
    map.set(key(item), item);
  }

  return [...map.values()];
}
