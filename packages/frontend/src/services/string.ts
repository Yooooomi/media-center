function pad(nb: number) {
  "worklet";
  return nb.toString().padStart(2, "0");
}

export function formatVideoDuration(nb: number) {
  "worklet";
  const HOUR = 1000 * 60 * 60;
  const MINUTE = 1000 * 60;
  const SECOND = 1000;
  const hours = Math.floor(nb / HOUR);
  nb -= hours * HOUR;
  const minutes = Math.floor(nb / MINUTE);
  nb -= minutes * MINUTE;
  const seconds = Math.floor(nb / SECOND);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
