// API Route for Foreign Exchange Rates
import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

export default async function handler(req, res) {
  try {
    // Fetch FX rates from Alpha Vantage
    const [gbpBdt, usdBdt, gbpUsd] = await Promise.all([
      // GBP to BDT
      axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=GBP&to_currency=BDT&apikey=${ALPHA_VANTAGE_API_KEY}`),
      // USD to BDT  
      axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=BDT&apikey=${ALPHA_VANTAGE_API_KEY}`),
      // GBP to USD
      axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=GBP&to_currency=USD&apikey=${ALPHA_VANTAGE_API_KEY}`)
    ]);

    const rates = [];

    // Process GBP to BDT
    if (gbpBdt.data['Realtime Currency Exchange Rate']) {
      const rate = gbpBdt.data['Realtime Currency Exchange Rate'];
      rates.push({
        pair: 'GBP / BDT',
        from: 'GBP',
        to: 'BDT',
        rate: parseFloat(rate['5. Exchange Rate']).toFixed(2),
        lastUpdated: rate['6. Last Refreshed']
      });
    }

    // Process USD to BDT
    if (usdBdt.data['Realtime Currency Exchange Rate']) {
      const rate = usdBdt.data['Realtime Currency Exchange Rate'];
      rates.push({
        pair: 'USD / BDT',
        from: 'USD',
        to: 'BDT',
        rate: parseFloat(rate['5. Exchange Rate']).toFixed(2),
        lastUpdated: rate['6. Last Refreshed']
      });
    }

    // Process GBP to USD
    if (gbpUsd.data['Realtime Currency Exchange Rate']) {
      const rate = gbpUsd.data['Realtime Currency Exchange Rate'];
      rates.push({
        pair: 'GBP / USD',
        from: 'GBP',
        to: 'USD',
        rate: parseFloat(rate['5. Exchange Rate']).toFixed(4),
        lastUpdated: rate['6. Last Refreshed']
      });
    }

    res.status(200).json({ rates, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching FX rates:', error);
    res.status(500).json({ error: 'Failed to fetch FX rates' });
  }
}
