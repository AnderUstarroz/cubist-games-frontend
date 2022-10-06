export const DEFAULT_DECIMALS = 9;

export function parseFloatInput(
  input: string,
  defaultValue: number = 0
): number {
  try {
    if (input) {
      return parseFloat(input);
    }
  } catch (error) {}
  return defaultValue;
}
