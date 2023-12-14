import axios, { Axios } from "axios";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";
import { TorrentClient } from "../applicative/torrentClient";
import { TorrentClientEntry } from "../domain/torrentClientEntry";

interface DelugeTorrent {
  time_added: number;
  download_payload_rate: number;
  state: "Error" | "Queued" | "Paused" | "Downloading" | "Seeding" | "Checking";
  max_upload_speed: number;
  eta: number;
  upload_payload_rate: number;
  max_download_speed: number;
  total_done: number;
  num_seeds: number;
  is_auto_managed: boolean;
  ratio: number;
  num_peers: number;
  seeds_peers_ratio: number;
  total_peers: number;
  total_uploaded: number;
  name: string;
  progress: number;
  queue: number;
  distributed_copies: number;
  total_wanted: number;
  tracker_host: string;
  total_seeds: number;
  save_path: string;
}

interface Stats {
  max_download: number;
  max_upload: number;
  max_num_connections: number;
  num_connections: number;
  upload_rate: number;
  download_rate: number;
  download_protocol_rate: number;
  upload_protocol_rate: number;
  dht_nodes: number;
  has_incoming_connections: number;
  free_space: number;
  external_ip: string;
}

interface DelugeRequest {
  connected: boolean;
  torrents: { [id: string]: DelugeTorrent };
  stats: Stats;
}

export class DelugeTorrentClient extends TorrentClient {
  private messageId = 0;

  private readonly endpoint: string;
  private readonly password: string;
  private readonly movieLocation: string;
  private readonly showLocation: string;
  private readonly axios: Axios;

  constructor(environmentHelper: EnvironmentHelper) {
    super();
    this.endpoint = environmentHelper.get("DELUGE_ENDPOINT");
    this.password = environmentHelper.get("DELUGE_PASSWORD");
    this.movieLocation = environmentHelper.get("DELUGE_MOVIE_LOCATION");
    this.showLocation = environmentHelper.get("DELUGE_SHOW_LOCATION");
    this.axios = axios.create({
      baseURL: this.endpoint,
    });
  }

  async _makeCall(method: string, params: any[] = []) {
    if (this.messageId === 1024) {
      this.messageId = 0;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const { data, headers: receivedHeaders } = await this.axios.post(
      this.endpoint + "json",
      {
        method,
        params,
        id: this.messageId++,
      },
      {
        withCredentials: true,
        headers,
      }
    );
    return { data: data, headers: receivedHeaders as Record<string, string> };
  }

  async auth() {
    const { data: checkSession } = await this._makeCall("auth.check_session");

    if (checkSession.result) {
      return true;
    }
    const { data } = await this._makeCall("auth.login", [this.password]);
    if (!data.result) {
      throw new Error("Auth failed, does the password valided?");
    }
    return true;
  }

  async call(method: string, params: any[] = []) {
    return this._makeCall(method, params).then((response) => {
      const data = response.data;
      if (data.error) {
        throw data.error;
      }
      return data.result;
    });
  }

  async connect(host = 0) {
    if (typeof host === "number") {
      const hosts = await this.call("web.get_hosts");
      host = hosts[host][0];
    }
    return this.call("web.connect", [host]);
  }

  /**
   * get status of all torrents
   * @returns {Promise<any>}
   */
  async getTorrentRecord(): Promise<DelugeRequest> {
    await this.auth();
    return this.call("web.update_ui", [
      [
        "distributed_copies",
        "download_payload_rate",
        "eta",
        "is_auto_managed",
        "max_download_speed",
        "max_upload_speed",
        "name",
        "num_peers",
        "num_seeds",
        "progress",
        "queue",
        "ratio",
        "save_path",
        "seeds_peers_ratio",
        "state",
        "time_added",
        "total_done",
        "total_peers",
        "total_seeds",
        "total_uploaded",
        "total_wanted",
        "tracker_host",
        "upload_payload_rate",
      ],
      {},
    ]);
  }

  // {"id": 1, "result": ["core.upload_plugin", "core.rescan_plugins", "core.force_recheck", "core.glob", "core.remove_torrent", "core.resume_all_torrents", "core.queue_top", "daemon.get_method_list", "ltconfig.get_settings", "core.set_torrent_options", "core.set_torrent_prioritize_first_last", "core.get_session_state", "core.set_torrent_move_completed", "core.get_available_plugins", "core.set_torrent_file_priorities", "core.get_config", "core.disable_plugin", "core.test_listen_port", "core.connect_peer", "core.enable_plugin", "core.get_filter_tree", "ltconfig.get_original_settings", "core.set_torrent_remove_at_ratio", "core.get_torrent_status", "core.get_config_values", "core.pause_torrent", "core.move_storage", "core.force_reannounce", "core.add_torrent_file", "core.get_listen_port", "core.set_torrent_move_completed_path", "core.set_torrent_stop_at_ratio", "core.rename_folder", "core.add_torrent_url", "core.get_enabled_plugins", "core.get_libtorrent_version", "core.get_path_size", "core.set_torrent_max_connections", "core.get_config_value", "core.get_session_status", "core.create_torrent", "core.add_torrent_magnet", "daemon.info", "core.set_torrent_stop_ratio", "core.set_torrent_auto_managed", "core.pause_all_torrents", "ltconfig.get_preferences", "core.get_torrents_status", "core.rename_files", "core.get_free_space", "core.queue_bottom", "core.set_torrent_max_upload_speed", "ltconfig.get_preset", "ltconfig.set_preferences", "core.resume_torrent", "core.set_torrent_max_upload_slots", "core.set_config", "core.get_cache_status", "core.queue_down", "daemon.shutdown", "core.get_num_connections", "core.set_torrent_max_download_speed", "core.queue_up", "core.set_torrent_trackers"], "error": null}

  pause(torrentId: string) {
    return this._makeCall("core.pause_torrent", [torrentId]);
  }

  start(torrentId: string) {
    return this._makeCall("core.resume_torrent", [torrentId]);
  }

  delete(torrentId: string) {
    return this._makeCall("core.remove_torrent", [torrentId, true]);
  }

  rename(torrentId: string, newName: string) {
    return this._makeCall("core.rename_files", [torrentId, [[0, newName]]]);
  }

  async addTorrent(torrent: Buffer, isShow: boolean) {
    await this.auth();

    const form = new FormData();
    // @ts-ignore
    form.append("file", torrent, "file");

    const { data: filesAdded } = await this.axios.post("upload", form);
    const [fileAdded] = filesAdded.files;

    if (!fileAdded) {
      return;
    }

    const config = {
      path: fileAdded,
      options: {
        add_paused: false,
        download_location: isShow ? this.showLocation : this.movieLocation,
      },
    };

    return this.call("notifier.add_torrent_with_username", ["", config]);
  }

  async getState() {
    const torrents = await this.getTorrentRecord();
    return Object.entries(torrents.torrents).map(
      ([id, torrent]) =>
        new TorrentClientEntry({
          hash: id,
          downloaded: torrent.progress,
          speed: torrent.download_payload_rate,
        })
    );
  }

  async download(buffer: Buffer, isShow: boolean) {
    return this.addTorrent(buffer, isShow);
  }
}
