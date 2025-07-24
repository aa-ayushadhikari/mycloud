'use client';

import { useEffect, useState } from 'react';
import styles from './Pricing.module.css';
import Link from 'next/link';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptionTiers = async () => {
      try {
        setLoading(true);
        try {
          // Try to get from API first
          const tiers = await subscriptionService.getAllSubscriptionTiers();
          setPricingPlans(formatPricingPlans(tiers));
        } catch (error) {
          console.warn('Could not load subscription tiers from API, using mock data');
          // Fallback to mock data
          const mockTiers = subscriptionService.getSubscriptionTiers();
          setPricingPlans(formatPricingPlans(mockTiers));
        }
      } catch (error) {
        console.error('Error loading subscription tiers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionTiers();
  }, []);

  // Format subscription tiers to match the pricing UI format
  const formatPricingPlans = (tiers) => {
    return tiers.map(tier => {
      const features = [];
      
      // Add compute features
      features.push(`${tier.features.compute.vCPU} vCPU cores`);
      features.push(`${tier.features.compute.ram} GB RAM`);
      features.push(`Max ${tier.features.compute.instances} instance${tier.features.compute.instances > 1 ? 's' : ''}`);
      if (tier.features.compute.timeLimit) {
        features.push(`${tier.features.compute.timeLimit} minutes time limit`);
      } else {
        features.push('No time limit');
      }
      
      // Add storage features
      features.push(`${tier.features.storage.total} GB total storage`);
      
      // Add network features
      features.push(`${tier.features.network.dataTransfer} GB data transfer`);
      features.push(`${tier.features.network.publicIPs} public IP${tier.features.network.publicIPs > 1 ? 's' : ''}`);
      
      return {
        id: tier.id,
        name: tier.name,
        description: tier.id === 'free' 
          ? 'Try our cloud platform at no cost' 
          : tier.id === 'startup' 
            ? 'For personal projects and small startups'
            : tier.id === 'basic'
              ? 'For growing businesses and teams'
              : 'For large-scale applications',
        price: tier.price === 0 ? 'Free' : `${tier.price}`,
        features: features,
        isPopular: tier.id === 'basic',
        ctaText: tier.id === 'free' 
          ? 'Sign up free' 
          : isAuthenticated() 
            ? 'Upgrade plan' 
            : 'Start now'
      };
    });
  };

  if (loading) {
    return (
      <section id="pricing" className={styles.pricingSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Loading pricing plans...</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className={styles.pricingSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Transparent <span className={styles.highlight}>Pricing</span></h2>
          <p className={styles.sectionDescription}>
            Choose a plan that fits your needs
          </p>
        </div>

        <div className={styles.pricingGrid}>
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`${styles.pricingCard} ${plan.isPopular ? styles.popularPlan : ''}`}
            >
              {plan.isPopular && (
                <div className={styles.popularBadge}>Most Popular</div>
              )}
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planDescription}>{plan.description}</p>
              </div>
              
              <div className={styles.planPricing}>
                {plan.price !== 'Free' && <span className={styles.currencySymbol}>$</span>}
                <span className={styles.priceValue}>{plan.price}</span>
                {plan.price !== 'Free' && <span className={styles.billingPeriod}>/month</span>}
              </div>

              <ul className={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    <span className={styles.featureCheck}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className={styles.ctaWrapper}>
                <Link 
                  href={isAuthenticated() ? '/dashboard/billing' : '/signup'} 
                  className={`${styles.ctaButton} ${plan.isPopular ? styles.primaryCta : ''}`}
                >
                  {plan.ctaText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.pricingFooter}>
          <p>Need a custom solution? <Link href="/contact" className={styles.contactLink}>Contact us</Link></p>
        </div>
      </div>
    </section>
  );
};

export default Pricing; 