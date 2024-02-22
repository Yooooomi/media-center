export interface SSEInterface {
  listenOn(
    url: URL,
    headers: Record<string, any>,
    onData: (data: any) => void,
  ): () => void;
}
