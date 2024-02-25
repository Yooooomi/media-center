import { Shape } from "@media-center/domain-driven";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";

export class Resolution extends Shape({
  x: Number,
  y: Number,
}) {
  static none() {
    return new Resolution({ x: -1, y: -1 });
  }

  toString() {
    return `${this.x}x${this.y}`;
  }

  toDisplay() {
    if (this.x === -1 || this.y === -1) {
      return "Unknown";
    }
    const possibleResolutions = [
      { value: 7680, display: "8k" },
      { value: 3840, display: "4k" },
      { value: 2160, display: "2k" },
      { value: 1080, display: "1080p" },
      { value: 720, display: "720p" },
      { value: 640, display: "640p" },
      { value: 480, display: "480p" },
      { value: 360, display: "360p" },
    ];
    const thisResolution =
      possibleResolutions.find((r) => this.x >= r.value)?.display ?? "8k+";
    return thisResolution;
  }
}

export class HierarchyEntryInformation extends Shape({
  id: HierarchyItemId,
  checkedAtFileSize: Number,
  videoTrack: { type: String, resolution: Resolution },
  textTracks: [{ index: Number, name: String }],
  audioTracks: [{ index: Number, name: String }],
}) {}
