export function formattedDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    dateStyle: "long",
  });
}
