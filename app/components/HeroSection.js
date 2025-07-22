import styles from './HeroSection.module.css';
import Link from 'next/link';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className={styles.heroSection} id="hero">
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Cloud Solutions for the <span className={styles.highlight}>Future</span>
            </h1>
            <p className={styles.heroDescription}>
              Deploy, scale, and manage your applications with our secure and reliable cloud infrastructure. Built for developers, trusted by enterprises.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/signup" className={`${styles.primaryButton} btn-primary`}>
                Sign Up Free
              </Link>
              <Link href="/signin" className={styles.secondaryButton}>
                Sign In
              </Link>
            </div>
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>99.99%</span>
                <span className={styles.statLabel}>Uptime</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>200+</span>
                <span className={styles.statLabel}>Global Locations</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>10k+</span>
                <span className={styles.statLabel}>Business Customers</span>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.visualWrapper}>
              <div className={styles.glassCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardDot}></div>
                  <div className={styles.cardDot}></div>
                  <div className={styles.cardDot}></div>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.serverItem}>
                    <div className={styles.serverIcon}></div>
                    <div className={styles.serverInfo}>
                      <div className={styles.serverName}>Web Server</div>
                      <div className={styles.serverStatus}>Running</div>
                    </div>
                    <div className={styles.serverMetric}>99.9%</div>
                  </div>
                  <div className={styles.serverItem}>
                    <div className={styles.serverIcon}></div>
                    <div className={styles.serverInfo}>
                      <div className={styles.serverName}>Database</div>
                      <div className={styles.serverStatus}>Running</div>
                    </div>
                    <div className={styles.serverMetric}>99.9%</div>
                  </div>
                  <div className={styles.serverItem}>
                    <div className={styles.serverIcon}></div>
                    <div className={styles.serverInfo}>
                      <div className={styles.serverName}>Storage</div>
                      <div className={styles.serverStatus}>Running</div>
                    </div>
                    <div className={styles.serverMetric}>99.9%</div>
                  </div>
                </div>
              </div>
              <div className={`${styles.glassCard} ${styles.secondCard}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardDot}></div>
                  <div className={styles.cardDot}></div>
                  <div className={styles.cardDot}></div>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.chartContainer}>
                    <div className={styles.chartBar} style={{ height: '60%' }}></div>
                    <div className={styles.chartBar} style={{ height: '80%' }}></div>
                    <div className={styles.chartBar} style={{ height: '40%' }}></div>
                    <div className={styles.chartBar} style={{ height: '70%' }}></div>
                    <div className={styles.chartBar} style={{ height: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.heroBg}></div>
    </section>
  );
};

export default HeroSection; 