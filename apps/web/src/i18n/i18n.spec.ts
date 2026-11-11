import { LANGS, MESSAGES } from './i18n';

/** Every key path in a nested object, e.g. ['countdown.days', 'calendar.add']. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value)
    .flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe('i18n messages', () => {
  const reference = keyPaths(MESSAGES.es);

  it.each(LANGS)('%s has exactly the same keys as es', (lang) => {
    expect(keyPaths(MESSAGES[lang])).toEqual(reference);
  });

  it.each(LANGS)('%s has no empty texts', (lang) => {
    const empty = keyPaths(MESSAGES[lang]).filter((path) => {
      const text = path
        .split('.')
        .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], MESSAGES[lang]);
      return typeof text !== 'string' || text.trim() === '';
    });
    expect(empty).toEqual([]);
  });
});
