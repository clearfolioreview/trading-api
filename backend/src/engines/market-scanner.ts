// market-scanner.ts

// Function to scan high-liquidity stocks
function scanHighLiquidityStocks(stocks) {
    // Filter stocks based on turnover and instrument type
    const filteredStocks = stocks.filter(stock => {
        return stock.turnover >= 1000000000 && stock.instrumentType === 'Equity'; // ₹100 crore turnover
    });

    return filteredStocks;
}

// Sample usage
const stocks = [
    { symbol: 'XYZ', turnover: 1500000000, instrumentType: 'Equity' },
    { symbol: 'ABC', turnover: 800000000, instrumentType: 'Equity' },
    { symbol: 'LMN', turnover: 1200000000, instrumentType: 'Bond' },
];

const highLiquidityStocks = scanHighLiquidityStocks(stocks);
console.log(highLiquidityStocks);