import EventSource from "react-native-sse";
import { SSEInterface } from "./sse.interface";

export const SSE: SSEInterface = {
  listenOn(
    url: URL,
    headers: Record<string, any>,
    onData: (data: any) => void,
  ) {
    const es = new EventSource(url, {
      method: "GET",
      headers,
    });

    es.addEventListener("message", (message) => {
      if (!message.data) {
        return;
      }

      onData(message.data);
    });

    return () => {
      es.removeAllEventListeners();
      es.close();
    };
  },
};
