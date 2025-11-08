import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Dashboard.module.css';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [globalData, setGlobalData] = useState(null);
  const [bangladeshData, setBangladeshData] = useState(null);
  const [fxRates, setFxRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [globalRes, bdRes, fxRes] = await Promise.all([
        fetch('/api/global-markets'),
        fetch('/api/bangladesh-markets'),
        fetch('/api/fx-rates')
      ]);
      
      const globalData = await globalRes.json();
      const bdData = await bdRes.json();
      const fxData = await fxRes.json();
      
      setGlobalData(globalData);
      setBangladeshData(bdData);
      setFxRates(fxData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading economy dashboard...</div>;
  }

  // Process Bangladesh data to create proper indicators array
  const indicators = bangladeshData ? [
    { name: 'GDP GROWTH (BD)', value: bangladeshData.gdp || 'N/A' , numValue: parseFloat(bangladeshData.gdp) || 0 },
    { name: 'INFLATION RATE (BD)', value: bangladeshData.inflation || 'N/A' EXCHANGE RATE parseFloat(bangladeshData.inflation) || 0 },
    { name: 'EXCHANGE RATE', value: `USD/BDT: ${bangladeshData.exchangeRate || 'N/A'}` , numValue: parseFloat(bangladeshData.exchangeRate) || 0 }, },
    { name: 'FOREX RESERVES', value: bangladeshData.reserves || 'N/A' , numValue: parseFloat(bangladeshData.reserves) || 0},
  ] : [];

  return (
    <div className={styles.container}>
      <Head>
        <title>Economy Dashboard | Global & South Asian Markets</title>
        <meta name="description" content="Real-time global markets and South Asian economic indicators" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Economy Dashboard</h1>
          <p>Real-time global markets and South Asian economic indicators</p>
        </div>

        {/* Bangladesh Market - Moved to Top */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bangladesh Market</h2>
          <div className={styles.grid}>
            {/* DSEX Index */}
            {bangladeshData?.dsex && (
              <div className={styles.card}>
                <div className={styles.cardLabel}>DSEX INDEX</div>
                <div className={styles.cardValue}>{bangladeshData.dsex.value}</div>
                <div className={`${styles.cardChange} ${parseFloat(bangladeshData.dsex.change) >= 0 ? styles.positive : styles.negative}`}>
                  {parseFloat(bangladeshData.dsex.change) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(bangladeshData.dsex.change)).toFixed(1)}%
                </div>
              </div>
            )}
            {/* Top Stocks */}
            {bangladeshData?.topStocks?.map((stock) => (
              <div key={stock.symbol} className={styles.card}>
                <div className={styles.cardLabel}>{stock.symbol}</div>
                <div className={styles.cardValue}>{stock.price}</div>
                <div className={`${styles.cardChange} ${parseFloat(stock.change) >= 0 ? styles.positive : styles.negative}`}>
                  {parseFloat(stock.change) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(stock.change)).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Economic Indicators - Moved up */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Economic Indicators</h2>
          <div className={styles.grid}>
            {indicators.map((indicator) => (
              <div key={indicator.name} className={styles.card}>
                <div className={styles.cardLabel}>{indicator.name}</div>
                <div className={styles.cardValue}>{indicator.value}</div>
              </div>
            ))}
          </div>
        </section>

                                  {/* Economic Indices Charts */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Economic Trends</h2>
        <div className={styles.chartContainer}>
          <div className={styles.chartTitle}>Bangladesh Economic Indicators Overview</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={indicators}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="numValue" fill="#4F46E5" name="Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

        {/* FX Rates */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Foreign Exchange Rates</h2>
          <div className={styles.fxGrid}>
            {fxRates?.rates?.map((rate) => (
              <div key={rate.pair} className={styles.fxCard}>
                <div className={styles.fxPair}>{rate.pair}</div>
                <div className={styles.fxRate}>{rate.rate}</div>
                <div className={styles.cardLabel}>Last updated: {new Date(rate.lastUpdated).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Markets - Moved down */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Global Markets</h2>
          <div className={styles.grid}>
            {globalData?.indices?.map((market) => (
              <div key={market.symbol} className={styles.card}>
                <div className={styles.cardLabel}>{market.symbol}</div>
                <div className={styles.cardValue}>{market.price}</div>
                <div className={`${styles.cardChange} ${parseFloat(market.change) >= 0 ? styles.positive : styles.negative}`}>
                  {parseFloat(market.change) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(market.change)).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <p>Data powered by Alpha Vantage, World Bank API, and Bangladesh Stock Exchange</p>
          <p>Last updated: {new Date().toLocaleString()}</p>
        </footer>
      </main>
    </div>
  );
}
