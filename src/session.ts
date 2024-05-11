/* eslint-disable class-methods-use-this */
import { DurableObject } from "cloudflare:workers";
import { WebMultiViewSync } from "@/sync";

type Sync = { SYNC: DurableObjectNamespace<WebMultiViewSync> };

export class WebMultiViewSession extends DurableObject<Sync> {
  async fetch(): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    const sockets = this.ctx.getWebSockets();

    const stub = this.env.SYNC.idFromName("counter");
    const counter = this.env.SYNC.get(stub);

    const m = message.toString();

    if (m === "increment") {
      await counter.increment();
    } else if (m === "decrement") {
      await counter.decrement();
    } else if (m === "reset") {
      await counter.reset();
    }

    const value = await counter.getCounterValue();

    for (const socket of sockets) {
      socket.send(JSON.stringify(value));
    }
  }

  async webSocketClose(ws: WebSocket, code: number) {
    ws.close(code, "Durable Object is closing WebSocket");
  }
}
