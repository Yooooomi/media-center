import { SafeRequest } from "../../../framework/safeRequest/safeRequest";
import { TorrentIndexer } from "../applicative/torrentIndexer";
import { JSDOM, DOMWindow } from "jsdom";
import { TorrentIndexerResult } from "../domain/torrentIndexerResult";
import { TorrentIndexerResultId } from "../domain/torrentIndexerResultId";

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
  constructor(private readonly safeRequest: SafeRequest) {
    super();
  }

  private logged = false;

  public async ensureAccessToDownload() {
    if (!this.logged) {
      await this.safeRequest.post("https://www3.yggtorrent.wtf/user/login", {
        id: "",
        pass: "",
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
      `https://www3.yggtorrent.wtf/engine/search?name=${query
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
        new TorrentIndexerResult(
          new TorrentIndexerResultId(gets.id[i]!),
          gets.name[i]!,
          gets.leech[i]!,
          gets.seed[i]!,
          YggTorrentIndexer.sizeToBytes(gets.size[i]!),
          gets.url[i]!
        )
      );
    }

    return results;
  }

  async download(torrentId: TorrentIndexerResultId) {
    const downloadUrl = `https://www3.yggtorrent.wtf/engine/download_torrent?id=${torrentId.toString()}`;
    return this.safeRequest.download(downloadUrl);
  }
}
