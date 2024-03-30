import { uniqBy } from "@media-center/algorithm";
import { Either, Id, Optional, Shape } from "@media-center/domain-driven";

export class TheTVDBId extends Id {}
export class ImdbId extends Id {}

export class CalendarItem extends Shape({
  id: Either(TheTVDBId, ImdbId),
  season: Number,
  episode: Optional(Number),
  releaseDate: Date,
}) {}

export class Calendar extends Shape({
  items: [CalendarItem],
}) {
  getAllDifferentIds() {
    return uniqBy(
      this.items.map((e) => e.id),
      (e) => e.toString(),
    );
  }

  getItemsConcerning(id: ImdbId | TheTVDBId) {
    return this.items.filter((e) => e.id.equals(id));
  }
}
