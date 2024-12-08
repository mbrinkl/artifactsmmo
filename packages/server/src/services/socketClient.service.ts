import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { WebSocket as WS } from "ws";

@Injectable()
export class SocketClientService implements OnModuleInit, OnModuleDestroy {
  private ws: WS;
  private readonly serverUrl = "wss://realtime.artifactsmmo.com";
  private reconnectDelay = 5000;
  private isReconnecting = false;
  private logger = new Logger(SocketClientService.name);

  onModuleInit() {
    this.connect();
  }

  private connect() {
    this.logger.log(`Attempting to connect to ${this.serverUrl}...`);

    this.ws = new WS(this.serverUrl);

    this.ws.on("open", () => {
      this.logger.log("WebSocket connection established");
      this.ws.send(JSON.stringify({ token: process.env.auth_token }));
      this.isReconnecting = false;
    });

    this.ws.on("message", (data) => {
      this.logger.log("Received data:", data.toString());
    });

    this.ws.on("error", (err: Error) => {
      this.logger.error("WebSocket error:", err.message);
      this.reconnect();
    });

    this.ws.on("close", () => {
      this.logger.warn("WebSocket connection closed");
      this.reconnect();
    });
  }

  private reconnect() {
    if (this.isReconnecting) {
      return;
    }
    this.isReconnecting = true;

    this.logger.log(`Reconnecting in ${this.reconnectDelay / 1000} seconds...`);
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  onModuleDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
