import styles from './Pricing.module.css';
import Link from 'next/link';

const Pricing = () => {
  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'For personal projects and small startups',
      price: '29',
      features: [
        '2 vCPU cores',
        '4 GB RAM',
        '100 GB Storage',
        '500 GB Data transfer',
        'Basic monitoring',
        'Community support'
      ],
      isPopular: false,
      ctaText: 'Start free trial'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing businesses and teams',
      price: '99',
      features: [
        '4 vCPU cores',
        '16 GB RAM',
        '500 GB Storage',
        '2 TB Data transfer',
        'Advanced monitoring',
        '24/7 email support',
        'Auto-scaling',
        'Load balancing'
      ],
      isPopular: true,
      ctaText: 'Start free trial'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large-scale applications and organizations',
      price: 'Custom',
      features: [
        'Dedicated resources',
        'Unlimited storage',
        'Unlimited data transfer',
        'Enterprise-grade security',
        'Priority support',
        'Dedicated account manager',
        'Custom SLAs',
        'Advanced compliance'
      ],
      isPopular: false,
      ctaText: 'Contact sales'
    }
  ];

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
                <span className={styles.currencySymbol}>$</span>
                <span className={styles.priceValue}>{plan.price}</span>
                <span className={styles.billingPeriod}>/month</span>
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
                  href={plan.id === 'enterprise' ? '/contact' : '/signup'} 
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