export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
