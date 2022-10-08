export function is_ascii_alphanumeric(text: string) {
  return !/[^a-zA-Z0-9]/.test(text);
}
