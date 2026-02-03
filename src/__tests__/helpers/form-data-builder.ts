/**
 * FormData builder helper — type-safe way to build FormData for testing server actions.
 * Usage: buildFormData({ name: "Acme", industry: "Tech" })
 */
export function buildFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  return formData;
}
