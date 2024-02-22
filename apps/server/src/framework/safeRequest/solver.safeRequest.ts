import Axios from "axios";
import { DomainError } from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { SafeRequest } from "./safeRequest";

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

class InvalidSessionTimeoutError extends DomainError {
  constructor(providedString: string) {
    super(
      `Invalid session timeout provided for flaresolverr: ${providedString} (minimum: ${SolverSafeRequest.MINIMUM_SESSION_DURATION_S})`,
    );
  }
}

export class SolverSafeRequest extends SafeRequest {
  private endpoint: string;

  constructor(environmentHelper: EnvironmentHelper) {
    super();
    this.endpoint = `${environmentHelper.get("FLARESOLVERR_ENDPOINT")}/v1`;
    const sessionTimeoutString = environmentHelper.get(
      "FLARESOLVERR_SESSION_TIMEOUT_S",
    );
    this.sessionTimeoutS = Number.parseInt(sessionTimeoutString);
    if (
      Number.isNaN(this.sessionTimeoutS) ||
      this.sessionTimeoutS <= SolverSafeRequest.MINIMUM_SESSION_DURATION_S
    ) {
      throw new InvalidSessionTimeoutError(sessionTimeoutString);
    }
  }

  private inited = false;
  private timeout: NodeJS.Timeout | null = null;
  private sessionTimeoutS: number;

  static MINIMUM_SESSION_DURATION_S = 30;
  static SESSION_NAME = "media-center";

  async init() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
    if (!this.inited) {
      await Axios.post(this.endpoint, {
        cmd: "sessions.create",
        session: SolverSafeRequest.SESSION_NAME,
      });
      this.inited = true;
    }
    this.timeout = setTimeout(
      this.destroySession.bind(this),
      this.sessionTimeoutS * 1000,
    );
  }

  private async destroySession() {
    this.inited = false;
    await Axios.post(this.endpoint, {
      cmd: "sessions.destroy",
      session: SolverSafeRequest.SESSION_NAME,
    });
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
