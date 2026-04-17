export interface StockData {
  symbol: string;
  price: number;
  volume: number;
  vwap: number;
  avgVolume20: number;
  turnover: number;
  timestamp: Date;
  instrumentType: string;
}

export interface TradeSignal {
  symbol: string;
  action: "BUY" | "SELL" | "NO_TRADE";
  price: number;
  quantity: number;
  reasons: string[];
  timestamp: Date;
  ruleChecksPassed: {
    instrumentType: boolean;
    turnover: boolean;
    volumeConfirmation: boolean;
    priceVsVWAP: boolean;
  };
}

export interface ExecutedTrade {
  id: string;
  symbol: string;
  action: "BUY" | "SELL";
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryTime: Date;
  exitTime?: Date;
  pnl?: number;
  charges: {
    brokerage: number;
    stt: number;
    gst: number;
    total: number;
  };
  status: "OPEN" | "CLOSED" | "FAILED";
  orderId: string;
  mode: "PAPER" | "LIVE";
}

export interface SystemState {
  tradesCount: number;
  consecutiveLosses: number;
  dailyProfit: number;
  openPositions: ExecutedTrade[];
  isKilled: boolean;
  killReason?: string;
  currentMode: "PAPER" | "LIVE";
  lastUpdateTime: Date;
}

export interface LogEntry {
  timestamp: Date;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  module: string;
  message: string;
  data?: Record<string, any>;
}