import { JSDOM, DOMWindow } from "jsdom";
import { SafeRequest } from "../../../framework/safeRequest/safeRequest";
import { TorrentIndexer } from "@media-center/domains/src/torrentIndexer/applicative/torrentIndexer";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { TorrentIndexerResult } from "@media-center/domains/src/torrentIndexer/domain/torrentIndexerResult";
import { TorrentIndexerResultId } from "@media-center/domains/src/torrentIndexer/domain/torrentIndexerResultId";

const getters = (window: DOMWindow, document: DOMWindow["document"]) => ({
  category: [...document.querySelectorAll("[id=torrent_name]")].map((e) =>
    Math.abs(
      +window
        .getComputedStyle(
          e.parentElement!.previousElementSibling!.children[1]!.children[0]!
        )
        .backgroundPositionY.split("px")[0]!
    )
  ),
  name: [...document.querySelectorAll("[id=torrent_name]")].map((e) =>
    e.textContent!.trim()
  ),
  url: [...document.querySelectorAll("[id=torrent_name]")].map(
    (e) => e.getAttribute("href")!
  ),
  id: [...document.querySelectorAll("[id=get_nfo]")].map(
    (e) => e.getAttribute("target")!
  ),
  age: [...document.querySelectorAll("[class=ico_clock-o]")].map(
    (e) => +e.previousSibling!.textContent!
  ),
  size: [...document.querySelectorAll("[id=get_nfo]")].map(
    (e) =>
      e.parentElement!.nextElementSibling!.nextElementSibling!
        .nextElementSibling!.textContent!
  ),
  completed: [...document.querySelectorAll("[id=get_nfo]")].map(
    (e) =>
      +e.parentElement!.nextElementSibling!.nextElementSibling!
        .nextElementSibling!.nextElementSibling!.textContent!
  ),
  seed: [...document.querySelectorAll("[id=get_nfo]")].map(
    (e) =>
      +e.parentElement!.nextElementSibling!.nextElementSibling!
        .nextElementSibling!.nextElementSibling!.nextElementSibling!
        .textContent!
  ),
  leech: [...document.querySelectorAll("[id=get_nfo]")].map(
    (e) =>
      +e.parentElement!.nextElementSibling!.nextElementSibling!
        .nextElementSibling!.nextElementSibling!.nextElementSibling!
        .nextElementSibling!.textContent!
  ),
});

export class YggTorrentIndexer extends TorrentIndexer {
  constructor(
    environmentHelper: EnvironmentHelper,
    private readonly safeRequest: SafeRequest
  ) {
    super();
    this.username = environmentHelper.get("YGG_TORRENT_USERNAME");
    this.password = environmentHelper.get("YGG_TORRENT_PASSWORD");
  }

  private static EXTENSION = "qa";
  private static URL = `https://www3.yggtorrent.${YggTorrentIndexer.EXTENSION}`;

  private username: string;
  private password: string;
  private logged = false;

  public async ensureAccessToDownload() {
    if (!this.logged) {
      await this.safeRequest.post(`${YggTorrentIndexer.URL}/user/login`, {
        id: this.username,
        pass: this.password,
        ci_csrf_token: "",
      });
      this.logged = true;
    }
  }

  static sizeToBytes(size: string) {
    if (size.endsWith("Ko")) {
      return +size.split("Ko")[0]! * 1024;
    }
    if (size.endsWith("Mo")) {
      return +size.split("Mo")[0]! * 1024 * 1024;
    }
    if (size.endsWith("Go")) {
      return +size.split("Go")[0]! * 1024 * 1024 * 1024;
    }
    return 0;
  }

  async search(query: string) {
    const result = await this.safeRequest.get(
      `${YggTorrentIndexer.URL}/engine/search?name=${query
        .split(" ")
        .join("+")}&do=search&order=desc&sort=seed`
    );
    if (!result.status) {
      return [];
    }
    const dom = new JSDOM(result.page);
    const gets = getters(dom.window, dom.window.document);

    const results: TorrentIndexerResult[] = [];

    for (let i = 0; i < gets.age.length; i += 1) {
      results.push(
        new TorrentIndexerResult({
          id: new TorrentIndexerResultId(gets.id[i]!),
          name: gets.name[i]!,
          leechers: gets.leech[i]!,
          seeders: gets.seed[i]!,
          size: YggTorrentIndexer.sizeToBytes(gets.size[i]!),
          pageUrl: gets.url[i]!,
        })
      );
    }

    return results;
  }

  async download(torrentId: TorrentIndexerResultId) {
    const downloadUrl = `${
      YggTorrentIndexer.URL
    }/engine/download_torrent?id=${torrentId.toString()}`;
    return this.safeRequest.download(downloadUrl);
  }
}
