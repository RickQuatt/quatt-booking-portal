type Entries<T> = {
  [K in keyof T]-?: [K, T[K]];
}[keyof T][];

/**
 * Maintains type information for Object.entries
 */
export const getEntries = <T extends object>(obj: T) =>
  Object.entries(obj) as Entries<T>;

export const getKeys = Object.keys as <T extends object>(
  obj: T,
) => Array<keyof T>;
export const getValues = Object.values as <T extends object>(
  obj: T,
) => Array<T[keyof T]>;
