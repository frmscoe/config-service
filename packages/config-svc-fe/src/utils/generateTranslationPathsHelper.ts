/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
type PathLeafType<T> =
  T extends Record<string, any> ? { [K in keyof T]: PathLeafType<T[K]> } : string;

export const generateTranslationPaths = <T extends Record<string, any>>(
  obj: T,
  currentPath: string = "",
): PathLeafType<T> =>
  Object.keys(obj).reduce((acc: any, key: string) => {
    const typedKey = key as keyof typeof obj; // Narrow down the type
    const newPath = currentPath ? `${currentPath}.${key}` : `${key}`;

    if (typeof obj[typedKey] === "object" && obj[typedKey] !== null) {
      acc[key] = generateTranslationPaths(obj[typedKey] as Record<string, any>, newPath);
    } else {
      acc[key] = newPath;
    }
    return acc;
  }, {} as PathLeafType<T>);
