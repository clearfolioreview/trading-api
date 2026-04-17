import axios, { AxiosInstance } from "axios";
import { KOTAK_CONFIG } from "../config/kotak-config";

interface OrderRequest {
  symbol: string;
  action: "BUY" | "SELL";
  quantity: number;
  price: number;
  orderType: "LIMIT" | "MARKET";
}

export class KotakNeoAPI {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: KOTAK_CONFIG.BASE_URL,
      timeout: 10000,
    });
  }

  async authenticate(): Promise<void> {
    try {
      const response = await this.client.post("/auth/login", {
        userId: KOTAK_CONFIG.USER_ID,
        password: KOTAK_CONFIG.PASSWORD,
        consumerKey: KOTAK_CONFIG.CONSUMER_KEY,
        consumerSecret: KOTAK_CONFIG.CONSUMER_SECRET,
      });

      this.accessToken = response.data.accessToken;
      console.log("[KotakNeoAPI] Authentication successful");
    } catch (error) {
      throw new Error(`Kotak API authentication failed: ${error}`);
    }
  }

  async getTopStocks(
    limit: number
  ): Promise<
    Array<{
      symbol: string;
      turnover: number;
      instrumentType: string;
    }>
  > {
    try {
      const response = await this.client.get("/market/top-stocks", {
        params: { limit },
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      return response.data.stocks.map((s: any) => ({
        symbol: s.symbol,
        turnover: s.price * s.volume,
        instrumentType: s.instrumentType,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch top stocks: ${error}`);
    }
  }

  async getCandles(
    symbol: string,
    period: number
  ): Promise<
    Array<{
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      vwap: number;
      timestamp: Date;
    }>
  > {
    try {
      const response = await this.client.get(`/market/candles/${symbol}`, {
        params: { period, interval: "1min" },
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      return response.data.candles.map((c: any) => ({
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
        vwap: c.vwap || this.calculateVWAP(c),
        timestamp: new Date(c.timestamp),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch candles for ${symbol}: ${error}`);
    }
  }

  async placeOrder(request: OrderRequest): Promise<string> {
    try {
      const response = await this.client.post(
        "/orders/place",
        {
          symbol: request.symbol,
          action: request.action,
          quantity: request.quantity,
          price: request.price,
          orderType: request.orderType,
          productType: "MIS",
        },
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      return response.data.orderId;
    } catch (error) {
      throw new Error(`Failed to place order: ${error}`);
    }
  }

  async getOrderStatus(orderId: string): Promise<string> {
    try {
      const response = await this.client.get(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      return response.data.status;
    } catch (error) {
      throw new Error(`Failed to fetch order status: ${error}`);
    }
  }

  private calculateVWAP(candle: any): number {
    return (candle.high + candle.low + candle.close) / 3;
  }
}