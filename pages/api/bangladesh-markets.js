// API route to fetch Bangladesh market and economic data
import axios from 'axios';

const BD_STOCK_API = process.env.BD_STOCK_API_URL || 'https://bd-stock-api.vercel.app/v1';
const WORLD_BANK_API = process.env.WORLD_BANK_API_URL || 'https://api.worldbank.org/v2';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = {
      dsex: null,
      topStocks: [],
      gdp: null,
      inflation: null,
      exchangeRate: null,
      reserves: null
    };

    // Fetch DSEX index data
    try {
      const dsexResponse = await axios.get(`${BD_STOCK_API}/dse/dsexdata`);
      if (dsexResponse.data) {
        const data = dsexResponse.data;
        results.dsex = {
          value: data.value || data.index_value,
          change: data.change || data.change_percent || 0,
          volume: data.volume
        };
      }
    } catch (error) {
      console.error('Error fetching DSEX data:', error.message);
      // Fallback mock data for development
      results.dsex = {
        value: '5245.50',
        change: 0.25,
        volume: '15000000'
      };
    }

    // Fetch top 30 stocks
    try {
      const stocksResponse = await axios.get(`${BD_STOCK_API}/dse/top30`);
      if (stocksResponse.data && Array.isArray(stocksResponse.data)) {
        results.topStocks = stocksResponse.data.slice(0, 10).map(stock => ({
          symbol: stock.symbol || stock.trading_code,
          price: stock.ltp || stock.last_trade_price,
          change: stock.change || stock.change_percent || 0,
          volume: stock.volume
        }));
      }
    } catch (error) {
      console.error('Error fetching top stocks:', error.message);
      // Fallback mock data
      results.topStocks = [
        { symbol: 'SQURPHARMA', price: '215.50', change: 1.2, volume: '250000' },
        { symbol: 'BRACBANK', price: '45.80', change: -0.5, volume: '180000' },
        { symbol: 'GPHISPAT', price: '88.20', change: 0.8, volume: '120000' },
        { symbol: 'BRAC', price: '52.30', change: 1.5, volume: '95000' },
        { symbol: 'RENATA', price: '820.00', change: -0.3, volume: '45000' }
      ];
    }

    // Fetch World Bank economic indicators for Bangladesh
    try {
      const bdCountryCode = 'BD';
      
      // GDP Growth Rate
      const gdpResponse = await axios.get(
        `${WORLD_BANK_API}/country/${bdCountryCode}/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1&date=2020:2024`
      );
      if (gdpResponse.data && gdpResponse.data[1] && gdpResponse.data[1][0]) {
        results.gdp = `${gdpResponse.data[1][0].value?.toFixed(2)}%` || '6.5%';
      } else {
        results.gdp = '6.5%';
      }

      // Inflation Rate
      const inflationResponse = await axios.get(
        `${WORLD_BANK_API}/country/${bdCountryCode}/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1&date=2020:2024`
      );
      if (inflationResponse.data && inflationResponse.data[1] && inflationResponse.data[1][0]) {
        results.inflation = `${inflationResponse.data[1][0].value?.toFixed(2)}%` || '7.8%';
      } else {
        results.inflation = '7.8%';
      }

    } catch (error) {
      console.error('Error fetching World Bank data:', error.message);
      results.gdp = '6.5%';
      results.inflation = '7.8%';
    }

    // Exchange rate (USD/BDT) - using fallback as real-time forex needs special API
    results.exchangeRate = '110.50';
    results.reserves = '$31.2 billion';

    res.status(200).json({
      ...results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bangladesh markets API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Bangladesh market data',
      message: error.message 
    });
  }
}
