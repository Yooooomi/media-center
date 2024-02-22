export abstract class SafeRequest {
  abstract get(
    url: string,
  ): Promise<{ status: false } | { status: true; page: string }>;
  abstract post(
    url: string,
    postData: Record<string, string | number>,
  ): Promise<{ status: false } | { status: true; page: string }>;
  abstract download(url: string): Promise<Buffer>;
}
