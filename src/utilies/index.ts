export function createSlug(name: string): string {
  return String(name).toLocaleLowerCase().replaceAll(' ', '-');
}
