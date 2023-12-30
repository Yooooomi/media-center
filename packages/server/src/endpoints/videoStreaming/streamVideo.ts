import { Request, Response } from "express";
import * as path from "path";
import * as fs from "fs";

const contentTypes = {
  mkv: "video/x-matroska",
  avi: "video/avi",
  mp4: "video/mp4",
};

export function streamVideo(
  request: Request,
  response: Response,
  filepath: string
) {
  const extension = path.extname(filepath).slice(1);
  const total = fs.statSync(filepath).size;
  const { range } = request.headers;

  if (!range) {
    console.log("Didnt find range");
    return response.status(400).end();
  }

  const [startString, endString] = range.replace(/bytes=/, "").split("-");

  if (!startString) {
    return response.status(400).end();
  }

  const start = parseInt(startString, 10);
  // if last byte position is not present then it is the last byte of the video file.
  const end = endString ? parseInt(endString, 10) : total - 1;
  const chunksize = end - start + 1;

  response.writeHead(206, {
    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type":
      contentTypes[extension as keyof typeof contentTypes] ?? contentTypes.mp4,
  });

  return fs
    .createReadStream(filepath, {
      start: Math.min(start, end),
      end,
    })
    .pipe(response);
}
