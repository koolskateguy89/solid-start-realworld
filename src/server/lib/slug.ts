// https://stackoverflow.com/a/1983661/17381629
export function generateSlug(title: string) {
  return title.replace(/\s+/g, "-").toLowerCase();
}
