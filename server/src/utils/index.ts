export function excludeObjectField<
  T extends Record<string, any>,
  Key extends keyof T
>(object: T, keys: Key[]): Omit<T, Key> {
  try {
    return Object.fromEntries(
      Object.entries(object).filter(([key]) => !keys.includes(key as any))
    ) as any;
  } catch (error) {
    return {} as any;
  }
}
