'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../dashboard.module.css';
import dbStyles from './database.module.css';

const DatabasePage = () => {
  const [selectedService, setSelectedService] = useState(null);

  // Database service offerings
  const databaseServices = [
    {
      id: 'autonomous',
      name: 'Autonomous Database',
      description: 'Self-driving, self-securing, and self-repairing database service that eliminates complexity, human error, and manual management.',
      icon: '🤖',
      features: [
        'Automated backups and patching',
        'Auto-scaling resources',
        'Built-in data protection',
        'Instant provisioning',
        'Automated performance tuning'
      ],
      pricing: 'Starting at $0.058 per OCPU per hour',
      learnMoreLink: '/dashboard/database/autonomous'
    },
    {
      id: 'exadata',
      name: 'Exadata Database Service',
      description: 'Enterprise-grade database service with extreme performance for transaction processing, data warehousing, and mixed workloads.',
      icon: '⚡',
      features: [
        'Extreme performance for all workloads',
        'Consolidated database platform',
        'Advanced security features',
        'High availability architecture',
        'Elastic scaling of resources'
      ],
      pricing: 'Starting at $1.28 per OCPU per hour',
      learnMoreLink: '/dashboard/database/exadata'
    },
    {
      id: 'mysql',
      name: 'MySQL Database Service',
      description: 'Fully managed MySQL database service for developers and enterprise applications.',
      icon: '🐬',
      features: [
        'Native MySQL compatibility',
        'Automated backups and recovery',
        'Enterprise-grade security',
        'Automatic scaling',
        'High availability configurations'
      ],
      pricing: 'Starting at $0.028 per OCU per hour',
      learnMoreLink: '/dashboard/database/mysql'
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL Database Service',
      description: 'Fully managed PostgreSQL database service for enterprise workloads.',
      icon: '🐘',
      features: [
        'Full PostgreSQL compatibility',
        'Automated patching and backups',
        'Advanced security controls',
        'Flexible scaling options',
        'High availability with automatic failover'
      ],
      pricing: 'Starting at $0.034 per OCU per hour',
      learnMoreLink: '/dashboard/database/postgresql'
    },
    {
      id: 'nosql',
      name: 'NoSQL Database',
      description: 'Fully managed, highly available NoSQL database for document, key-value, and columnar data models.',
      icon: '📄',
      features: [
        'Multiple data models support',
        'JSON document storage',
        'Millisecond latency',
        'Elastic scaling',
        'Pay-per-use pricing'
      ],
      pricing: 'Starting at $0.023 per GB per hour',
      learnMoreLink: '/dashboard/database/nosql'
    },
    {
      id: 'global',
      name: 'Globally Distributed Database',
      description: 'Deploy databases across multiple regions with automatic synchronization and disaster recovery.',
      icon: '🌎',
      features: [
        'Multi-region deployment',
        'Automatic synchronization',
        'Geo-redundant backups',
        'Local data residency compliance',
        'Global data access with low latency'
      ],
      pricing: 'Starting at $0.085 per OCPU per hour',
      learnMoreLink: '/dashboard/database/global'
    }
  ];

  // Handle service selection for details view
  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  // Render the main database services grid
  const renderDatabaseServices = () => {
    return (
      <div className={dbStyles.servicesGrid}>
        {databaseServices.map(service => (
          <div
            key={service.id}
            className={dbStyles.serviceCard}
            onClick={() => handleServiceClick(service)}
          >
            <div className={dbStyles.serviceIcon}>{service.icon}</div>
            <h3 className={dbStyles.serviceName}>{service.name}</h3>
            <p className={dbStyles.serviceDescription}>{service.description}</p>
            <div className={dbStyles.servicePricing}>{service.pricing}</div>
            <button className={dbStyles.serviceDetailsButton}>View Details</button>
          </div>
        ))}
      </div>
    );
  };

  // Render detailed view of a selected service
  const renderServiceDetail = () => {
    if (!selectedService) return null;

    return (
      <div className={dbStyles.serviceDetailOverlay}>
        <div className={dbStyles.serviceDetailCard}>
          <div className={dbStyles.serviceDetailHeader}>
            <h2 className={dbStyles.serviceDetailTitle}>
              <span className={dbStyles.serviceDetailIcon}>{selectedService.icon}</span>
              {selectedService.name}
            </h2>
            <button
              className={dbStyles.closeDetailButton}
              onClick={() => setSelectedService(null)}
            >
              ✕
            </button>
          </div>
          
          <div className={dbStyles.serviceDetailContent}>
            <p className={dbStyles.serviceDetailDescription}>
              {selectedService.description}
            </p>
            
            <div className={dbStyles.serviceDetailSection}>
              <h3 className={dbStyles.serviceDetailSectionTitle}>Key Features</h3>
              <ul className={dbStyles.featureList}>
                {selectedService.features.map((feature, index) => (
                  <li key={index} className={dbStyles.featureItem}>
                    <span className={dbStyles.featureCheck}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className={dbStyles.serviceDetailSection}>
              <h3 className={dbStyles.serviceDetailSectionTitle}>Pricing</h3>
              <div className={dbStyles.serviceDetailPricing}>
                {selectedService.pricing}
              </div>
              <p className={dbStyles.pricingNote}>
                Actual costs depend on configuration and usage. Use our pricing calculator for a detailed estimate.
              </p>
            </div>
            
            <div className={dbStyles.serviceDetailActions}>
              <Link href={selectedService.learnMoreLink} className={dbStyles.learnMoreButton}>
                Learn More
              </Link>
              <Link href={`/dashboard/database/${selectedService.id}/create`} className={dbStyles.createButton}>
                Create Database
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={styles.breadcrumbs}>
        <Link href="/dashboard" className={styles.breadcrumbItem}>Dashboard</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>Database</span>
      </div>

      <div className={styles.serviceDetailContainer}>
        <div className={styles.serviceDetailHeader}>
          <h1 className={styles.serviceDetailTitle}>Database Services</h1>
          <Link href="/dashboard/database/instances" className={styles.createButton}>
            View My Databases
          </Link>
        </div>
        
        <div className={styles.serviceDescription}>
          Fully managed database services for all your application needs. Choose from multiple database engines, deployment options, and performance tiers.
        </div>
        
        <div className={dbStyles.databaseMetrics}>
          <div className={dbStyles.metricCard}>
            <span className={dbStyles.metricIcon}>🔄</span>
            <div className={dbStyles.metricInfo}>
              <div className={dbStyles.metricValue}>99.95%</div>
              <div className={dbStyles.metricName}>Uptime SLA</div>
            </div>
          </div>
          <div className={dbStyles.metricCard}>
            <span className={dbStyles.metricIcon}>⚡</span>
            <div className={dbStyles.metricInfo}>
              <div className={dbStyles.metricValue}>19x</div>
              <div className={dbStyles.metricName}>Faster Performance</div>
            </div>
          </div>
          <div className={dbStyles.metricCard}>
            <span className={dbStyles.metricIcon}>🛡️</span>
            <div className={dbStyles.metricInfo}>
              <div className={dbStyles.metricValue}>Enterprise</div>
              <div className={dbStyles.metricName}>Security & Compliance</div>
            </div>
          </div>
          <div className={dbStyles.metricCard}>
            <span className={dbStyles.metricIcon}>💰</span>
            <div className={dbStyles.metricInfo}>
              <div className={dbStyles.metricValue}>63%</div>
              <div className={dbStyles.metricName}>Lower TCO</div>
            </div>
          </div>
        </div>
      </div>
      
      {renderDatabaseServices()}
      {selectedService && renderServiceDetail()}
      
      <div className={dbStyles.databaseTools}>
        <h2 className={dbStyles.toolsTitle}>Database Tools & Resources</h2>
        
        <div className={dbStyles.toolsGrid}>
          <div className={dbStyles.toolCard}>
            <div className={dbStyles.toolIcon}>🔄</div>
            <h3 className={dbStyles.toolName}>Migration Tools</h3>
            <p className={dbStyles.toolDescription}>
              Tools and services to help you migrate your databases to MyCloud with minimal downtime.
            </p>
            <Link href="/dashboard/database/migration" className={dbStyles.toolLink}>Learn More</Link>
          </div>
          
          <div className={dbStyles.toolCard}>
            <div className={dbStyles.toolIcon}>📊</div>
            <h3 className={dbStyles.toolName}>Performance Analytics</h3>
            <p className={dbStyles.toolDescription}>
              Monitor and optimize your database performance with real-time analytics and recommendations.
            </p>
            <Link href="/dashboard/database/analytics" className={dbStyles.toolLink}>Learn More</Link>
          </div>
          
          <div className={dbStyles.toolCard}>
            <div className={dbStyles.toolIcon}>🔒</div>
            <h3 className={dbStyles.toolName}>Security Center</h3>
            <p className={dbStyles.toolDescription}>
              Comprehensive security tools for vulnerability assessment, data masking, and auditing.
            </p>
            <Link href="/dashboard/database/security" className={dbStyles.toolLink}>Learn More</Link>
          </div>
          
          <div className={dbStyles.toolCard}>
            <div className={dbStyles.toolIcon}>📚</div>
            <h3 className={dbStyles.toolName}>Documentation</h3>
            <p className={dbStyles.toolDescription}>
              Detailed guides, tutorials, and API references for all database services.
            </p>
            <Link href="/dashboard/docs/database" className={dbStyles.toolLink}>View Docs</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePage; 