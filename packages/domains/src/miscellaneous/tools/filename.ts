import { filenameParse } from "@ctrl/video-filename-parser";

export async function FilenameParse(input: string, isTv: boolean) {
  input = input.replace(/\[.*?\]/g, "");
  return filenameParse(input, isTv);
}
