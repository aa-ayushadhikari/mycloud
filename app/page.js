import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Services from './components/Services';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <HeroSection />
        <Services />
        <div id="solutions" className={styles.featuresSection}>
          <div className={styles.featuresContainer}>
            <div className={styles.featuresSectionHeader}>
              <h2 className={styles.featuresSectionTitle}>
                Enterprise Solutions for <span className={styles.highlightText}>Every Need</span>
              </h2>
              <p className={styles.featuresSectionDescription}>
                Discover how MyCloud can transform your business with our comprehensive suite of cloud solutions
              </p>
            </div>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🚀</div>
                <h3 className={styles.featureTitle}>High Performance</h3>
                <p className={styles.featureDescription}>
                  Industry-leading performance with the latest hardware and optimized infrastructure
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🛡️</div>
                <h3 className={styles.featureTitle}>Enterprise Security</h3>
                <p className={styles.featureDescription}>
                  Advanced security features and compliance with industry standards
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>⚖️</div>
                <h3 className={styles.featureTitle}>Scalable Resources</h3>
                <p className={styles.featureDescription}>
                  Scale up or down instantly based on your business needs
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💰</div>
                <h3 className={styles.featureTitle}>Cost-Effective</h3>
                <p className={styles.featureDescription}>
                  Pay only for what you use with transparent pricing and no hidden fees
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔄</div>
                <h3 className={styles.featureTitle}>High Availability</h3>
                <p className={styles.featureDescription}>
                  99.99% uptime guarantee with redundant infrastructure
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🌍</div>
                <h3 className={styles.featureTitle}>Global Network</h3>
                <p className={styles.featureDescription}>
                  Data centers across the globe for low-latency access anywhere
                </p>
              </div>
            </div>
          </div>
        </div>
        <Pricing />
        <div id="cta" className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
            <p className={styles.ctaDescription}>
              Join thousands of companies that trust MyCloud for their cloud infrastructure needs
            </p>
            <div className={styles.ctaButtons}>
              <a href="/signup" className={`${styles.ctaPrimaryButton} btn-primary`}>
                Sign Up Free
              </a>
              <a href="/signin" className={styles.ctaSecondaryButton}>
                Sign In
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
