import styles from './Services.module.css';

const Services = () => {
  const serviceItems = [
    {
      id: 1,
      icon: '🖥️',
      title: 'Compute',
      description: 'Scalable virtual machines, container services, and serverless computing for any workload.',
      features: ['Virtual Machines', 'Kubernetes Clusters', 'Serverless Functions']
    },
    {
      id: 2,
      icon: '🗄️',
      title: 'Storage',
      description: 'Secure, durable, and highly available storage for any data type, from bytes to petabytes.',
      features: ['Object Storage', 'Block Storage', 'File Systems']
    },
    {
      id: 3,
      icon: '🌐',
      title: 'Networking',
      description: 'Global network infrastructure for secure, high-performance connectivity.',
      features: ['Virtual Networks', 'Load Balancers', 'CDN']
    },
    {
      id: 4,
      icon: '🔒',
      title: 'Security',
      description: 'Comprehensive security services to protect your applications and data.',
      features: ['Identity & Access', 'Threat Detection', 'Encryption']
    },
    {
      id: 5,
      icon: '📊',
      title: 'Analytics',
      description: 'Powerful data analytics services to gain insights and make data-driven decisions.',
      features: ['Data Warehousing', 'Big Data Processing', 'AI/ML']
    },
    {
      id: 6,
      icon: '📱',
      title: 'Developer Tools',
      description: 'Tools and services for building, testing, and deploying applications.',
      features: ['CI/CD Pipelines', 'API Management', 'Monitoring']
    }
  ];

  return (
    <section id="products" className={styles.servicesSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our <span className={styles.highlight}>Cloud Services</span></h2>
          <p className={styles.sectionDescription}>
            Everything you need to build, deploy, and scale your applications
          </p>
        </div>

        <div className={styles.servicesGrid}>
          {serviceItems.map((service) => (
            <div key={service.id} className={styles.serviceCard}>
              <div className={styles.serviceIcon}>{service.icon}</div>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
              <ul className={styles.featuresList}>
                {service.features.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    <span className={styles.featureCheck}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={`/#service-${service.id}`} className={styles.learnMore}>
                Learn more
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services; 