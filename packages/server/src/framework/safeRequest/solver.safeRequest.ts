import Axios from "axios";
import { SafeRequest } from "./safeRequest";
import { Filesystem } from "../valueObjects/fileSystem";

export interface FlareSolverResponse {
  status: string;
  message: string;
  solution: {
    url: string;
    status: number;
    cookies: {
      domain: string;
      expiry: number;
      httpOnly: boolean;
      name: string;
      path: string;
      sameSite: string;
      secure: boolean;
      value: string;
    }[];
    userAgent: string;
    headers: Headers;
    response: string;
  };
  startTimestamp: number;
  endTimestamp: number;
  version: string;
}

export class SolverSafeRequest extends SafeRequest {
  constructor(private readonly filesystem: Filesystem) {
    super();
  }

  private inited = false;
  private endpoint = "http://localhost:8191/v1";

  static SESSION_NAME = "media-center";

  async init() {
    if (!this.inited) {
      await Axios.post(this.endpoint, {
        cmd: "sessions.create",
        session: SolverSafeRequest.SESSION_NAME,
      });
      this.inited = true;
    }
  }

  async get(url: string) {
    await this.init();
    const { data } = await Axios.post<FlareSolverResponse>(this.endpoint, {
      cmd: "request.get",
      url,
      maxTimeout: 60000,
      session: SolverSafeRequest.SESSION_NAME,
    });

    if (data.status !== "ok") {
      return { status: false } as const;
    }

    if (data.solution.status < 200 || data.solution.status >= 300) {
      return { status: false } as const;
    }

    return { status: true, page: data.solution.response as string } as const;
  }

  private getStringFromRecord(postData: Record<string, string | number>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(postData)) {
      params.append(key, value.toString());
    }

    // Get the URL-encoded string
    const encodedString = params.toString();
    return encodedString;
  }

  async post(url: string, postData: Record<string, string | number>) {
    await this.init();

    const encodedString = this.getStringFromRecord(postData);
    const { data } = await Axios.post<FlareSolverResponse>(this.endpoint, {
      cmd: "request.post",
      postData: encodedString,
      url,
      maxTimeout: 60000,
      session: SolverSafeRequest.SESSION_NAME,
    });

    if (data.status !== "ok") {
      return { status: false } as const;
    }

    if (data.solution.status < 200 || data.solution.status >= 300) {
      return { status: false } as const;
    }

    return { status: true, page: data.solution.response as string } as const;
  }

  async download(url: string) {
    await this.init();
    const { data } = await Axios.post<FlareSolverResponse>(this.endpoint, {
      cmd: "request.get",
      url,
      maxTimeout: 60000,
      session: SolverSafeRequest.SESSION_NAME,
    });
    const { cookies } = data.solution;
    const { data: fileData } = await Axios.get<ArrayBuffer>(url, {
      headers: {
        Cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; "),
      },
      withCredentials: true,
      responseType: "arraybuffer",
    });

    return Buffer.from(fileData);
  }
}
