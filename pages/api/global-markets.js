// API route to fetch global market data from Alpha Vantage
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch major global indices
    const symbols = ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI'];
    const indices = [];

    for (const symbol of symbols) {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: API_KEY
          }
        });

        const quote = response.data['Global Quote'];
        if (quote && quote['05. price']) {
          indices.push({
            symbol: symbol,
            price: parseFloat(quote['05. price']).toFixed(2),
            change: parseFloat(quote['10. change percent'].replace('%', '')).toFixed(2),
            volume: quote['06. volume']
          });
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
      }
    }

    // Add forex data
    const forexPairs = [
      { from: 'EUR', to: 'USD' },
      { from: 'GBP', to: 'USD' },
      { from: 'JPY', to: 'USD' }
    ];

    const forex = [];
    for (const pair of forexPairs) {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'CURRENCY_EXCHANGE_RATE',
            from_currency: pair.from,
            to_currency: pair.to,
            apikey: API_KEY
          }
        });

        const rate = response.data['Realtime Currency Exchange Rate'];
        if (rate) {
          forex.push({
            pair: `${pair.from}/${pair.to}`,
            rate: parseFloat(rate['5. Exchange Rate']).toFixed(4)
          });
        }
      } catch (error) {
        console.error(`Error fetching ${pair.from}/${pair.to}:`, error.message);
      }
    }

    res.status(200).json({
      indices,
      forex,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Global markets API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch global market data',
      message: error.message 
    });
  }
}
