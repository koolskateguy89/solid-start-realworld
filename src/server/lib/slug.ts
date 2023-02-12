export function generateSlug(title: string) {
  // TODO: need to replace group of spaces with dash
  // this just replaces each space with dash
  return title.toLowerCase().replaceAll(/ /g, "-");
}
