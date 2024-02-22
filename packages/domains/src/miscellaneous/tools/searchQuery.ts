import { Shape } from "@media-center/domain-driven";

export class SearchQuery extends Shape(String) {
  static from(query: string): SearchQuery {
    return new SearchQuery(
      query
        .replace(/[-=\+\.:]/g, "")
        .replace(/&/g, "and")
        .replace(/\s+/g, " "),
    );
  }
}
