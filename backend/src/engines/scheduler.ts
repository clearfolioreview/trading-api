import { DataEngine } from "./data-engine";
import { MarketScanner } from "./market-scanner";
import { RuleEngine } from "./rule-engine";
import { ExecutionEngine } from "./execution-engine";
import { TRADING_CONFIG } from "../config";
import { Logger } from "../utils/logger";

export class Scheduler {
  private dataEngine: DataEngine;
  private scanner: MarketScanner;
  private executionEngine: ExecutionEngine;
  private logger: Logger;
  private isRunning = false;
  private scannerInterval: NodeJS.Timeout | null = null;

  constructor(
    dataEngine: DataEngine,
    scanner: MarketScanner,
    executionEngine: ExecutionEngine,
    logger: Logger
  ) {
    this.dataEngine = dataEngine;
    this.scanner = scanner;
    this.executionEngine = executionEngine;
    this.logger = logger;
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      console.warn("[Scheduler] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[Scheduler] Starting trading loop...");

    this.scannerInterval = setInterval(async () => {
      try {
        const stocks = await this.scanner.scanHighLiquidityStocks();

        if (stocks.length === 0) {
          this.logger.warn(
            "scheduler",
            "No high-liquidity stocks found",
            {}
          );
          return;
        }

        const stockDataList = await this.dataEngine.getBatchStockData(
          stocks.slice(0, 50)
        );

        for (const stockData of stockDataList) {
          const signal = RuleEngine.checkTradingRules(stockData);

          if (signal.action !== "NO_TRADE") {
            const executedTrade = await this.executionEngine.executeTrade(
              signal
            );

            if (executedTrade) {
              this.logger.info("scheduler", "Trade executed", {
                symbol: signal.symbol,
                action: signal.action,
                price: signal.price,
              });
            }
          }
        }

        this.logger.debug("scheduler", "Cycle complete", {
          stocksScanned: stocks.length,
          processed: stockDataList.length,
        });
      } catch (error) {
        this.logger.error("scheduler", "Scheduler cycle failed", {
          error: String(error),
        });
      }
    }, TRADING_CONFIG.SCANNER_INTERVAL_MS);
  }

  stop(): void {
    if (this.scannerInterval) {
      clearInterval(this.scannerInterval);
      this.scannerInterval = null;
    }
    this.isRunning = false;
    console.log("[Scheduler] Stopped");
  }

  isActive(): boolean {
    return this.isRunning;
  }
}