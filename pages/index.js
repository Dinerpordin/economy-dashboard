import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Dashboard.module.css';

export default function Home() {
  const [globalData, setGlobalData] = useState(null);
  const [bangladeshData, setBangladeshData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [globalRes, bdRes] = await Promise.all([
        fetch('/api/global-markets'),
        fetch('/api/bangladesh-markets')
      ]);
      
      const global = await globalRes.json();
      const bd = await bdRes.json();
      
      setGlobalData(global);
      setBangladeshData(bd);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading economy dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Economy Dashboard | Global & South Asian Markets</title>
        <meta name="description" content="Advanced economy dashboard with global and South Asian market data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Economy Dashboard</h1>
        <p className={styles.subtitle}>Real-time global markets and South Asian economic indicators</p>
        
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Global Markets</h2>
          <div className={styles.cardGrid}>
            {globalData?.indices?.map((index, i) => (
              <div key={i} className={styles.card}>
                <h3 className={styles.cardTitle}>{index.symbol}</h3>
                <p className={styles.cardValue}>{index.price}</p>
                <p className={index.change >= 0 ? styles.positive : styles.negative}>
                  {index.change >= 0 ? '▲' : '▼'} {Math.abs(index.change)}%
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bangladesh Market</h2>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>DSEX Index</h3>
              <p className={styles.cardValue}>{bangladeshData?.dsex?.value || 'Loading...'}</p>
              <p className={bangladeshData?.dsex?.change >= 0 ? styles.positive : styles.negative}>
                {bangladeshData?.dsex?.change >= 0 ? '▲' : '▼'} {Math.abs(bangladeshData?.dsex?.change || 0)}%
              </p>
            </div>
            {bangladeshData?.topStocks?.slice(0, 5).map((stock, i) => (
              <div key={i} className={styles.card}>
                <h3 className={styles.cardTitle}>{stock.symbol}</h3>
                <p className={styles.cardValue}>{stock.price}</p>
                <p className={stock.change >= 0 ? styles.positive : styles.negative}>
                  {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change)}%
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Economic Indicators</h2>
          <div className={styles.indicatorGrid}>
            <div className={styles.indicator}>
              <h4>GDP Growth (BD)</h4>
              <p className={styles.indicatorValue}>{bangladeshData?.gdp || 'N/A'}</p>
            </div>
            <div className={styles.indicator}>
              <h4>Inflation Rate (BD)</h4>
              <p className={styles.indicatorValue}>{bangladeshData?.inflation || 'N/A'}</p>
            </div>
            <div className={styles.indicator}>
              <h4>Exchange Rate</h4>
              <p className={styles.indicatorValue}>USD/BDT: {bangladeshData?.exchangeRate || 'N/A'}</p>
            </div>
            <div className={styles.indicator}>
              <h4>Forex Reserves</h4>
              <p className={styles.indicatorValue}>{bangladeshData?.reserves || 'N/A'}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Data powered by Alpha Vantage, World Bank API, and Bangladesh Stock Exchange</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}
