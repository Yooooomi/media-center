export async function FilenameParse(input: string, isTv: boolean) {
  const { filenameParse } = await import("@ctrl/video-filename-parser");
  input = input.replace(/\[.*?\]/g, "");
  return filenameParse(input, isTv);
}
