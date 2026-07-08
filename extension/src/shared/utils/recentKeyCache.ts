export function createRecentKeyCache(maxSize = 300) {
  const keys = new Set<string>();
  const order: string[] = [];

  function has(key: string) {
    return keys.has(key);
  }

  function add(key: string) {
    if (keys.has(key)) return;

    keys.add(key);
    order.push(key);

    while (order.length > maxSize) {
      const oldest = order.shift();

      if (oldest) {
        keys.delete(oldest);
      }
    }
  }

  return {
    has,
    add
  };
}