import { EventSourcePolyfill } from "event-source-polyfill";
import { SSEInterface } from "./sse.interface";

export const SSE: SSEInterface = {
  listenOn(url, headers, onData) {
    const source = new EventSourcePolyfill(url.toString(), {
      withCredentials: true,
      headers,
    });

    source.onmessage = (e) => {
      onData(e.data);
    };

    return source.close.bind(source);
  },
};
