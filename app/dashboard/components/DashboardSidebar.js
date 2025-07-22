'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../dashboard.module.css';

const DashboardSidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedServices, setExpandedServices] = useState({
    compute: true,
    storage: false,
    networking: false,
    database: false,
    developer: false
  });

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const toggleServiceExpand = (serviceKey) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceKey]: !prev[serviceKey]
    }));
  };

  // Check if the current path is active
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Compute Services
  const computeServices = [
    { name: 'Overview', path: '/dashboard/compute' },
    { name: 'Instances', path: '/dashboard/compute/instances' },
    { name: 'Instance Maintenance', path: '/dashboard/compute/maintenance' },
    { name: 'Dedicated VM Hosts', path: '/dashboard/compute/dedicated-hosts' },
    { name: 'Instance Configurations', path: '/dashboard/compute/configurations' },
    { name: 'Instance Pools', path: '/dashboard/compute/pools' },
    { name: 'Cluster Networks', path: '/dashboard/compute/cluster-networks' },
    { name: 'Compute Clusters', path: '/dashboard/compute/clusters' },
    { name: 'Autoscaling', path: '/dashboard/compute/autoscaling' },
    { name: 'Capacity Reservations', path: '/dashboard/compute/reservations' },
    { name: 'Custom Images', path: '/dashboard/compute/images' },
    { name: 'Secure Desktops', path: '/dashboard/compute/secure-desktops' },
    { name: 'Desktop Pools', path: '/dashboard/compute/desktop-pools' },
    { name: 'Desktop Volumes', path: '/dashboard/compute/desktop-volumes' }
  ];

  // Storage Services
  const storageServices = [
    // Block Storage
    { name: 'Block Storage Overview', path: '/dashboard/storage' },
    { name: 'Block Volumes', path: '/dashboard/storage/block-volumes' },
    { name: 'Block Volume Backups', path: '/dashboard/storage/volume-backups' },
    { name: 'Block Volume Replicas', path: '/dashboard/storage/volume-replicas' },
    { name: 'Volume Groups', path: '/dashboard/storage/volume-groups' },
    { name: 'Volume Group Backups', path: '/dashboard/storage/volume-group-backups' },
    { name: 'Volume Group Replicas', path: '/dashboard/storage/volume-group-replicas' },
    { name: 'Backup Policies', path: '/dashboard/storage/backup-policies' },
    // File Storage
    { name: 'File Systems', path: '/dashboard/storage/file-systems' },
    { name: 'Mount Targets', path: '/dashboard/storage/mount-targets' },
    { name: 'Lustre File Storage', path: '/dashboard/storage/lustre' },
    { name: 'Lustre File Systems', path: '/dashboard/storage/lustre-systems' },
    // Object Storage
    { name: 'Buckets', path: '/dashboard/storage/buckets' },
    { name: 'Private Endpoints', path: '/dashboard/storage/private-endpoints' }
  ];

  // Networking Services
  const networkingServices = [
    { name: 'Overview', path: '/dashboard/networking' },
    { name: 'Virtual Cloud Networks', path: '/dashboard/networking/vcn' },
    { name: 'Web Application Acceleration', path: '/dashboard/networking/acceleration' },
    { name: 'Load Balancers', path: '/dashboard/networking/load-balancers' },
    { name: 'Network Load Balancers', path: '/dashboard/networking/network-load-balancers' },
    { name: 'DNS Management', path: '/dashboard/networking/dns' },
    { name: 'Public Zones', path: '/dashboard/networking/public-zones' },
    { name: 'Private Zones', path: '/dashboard/networking/private-zones' },
    { name: 'Traffic Management', path: '/dashboard/networking/traffic' },
    { name: 'Private Views', path: '/dashboard/networking/private-views' },
    { name: 'Private Resolvers', path: '/dashboard/networking/private-resolvers' },
    { name: 'HTTP Redirects', path: '/dashboard/networking/http-redirects' },
    { name: 'TSIG Keys', path: '/dashboard/networking/tsig-keys' },
    { name: 'Site-to-Site VPN', path: '/dashboard/networking/vpn' },
    { name: 'FastConnect', path: '/dashboard/networking/fast-connect' },
    { name: 'Dynamic Routing Gateway', path: '/dashboard/networking/routing-gateway' },
    { name: 'Reserved Public IPs', path: '/dashboard/networking/reserved-ips' },
    { name: 'Public IP Pools', path: '/dashboard/networking/ip-pools' },
    { name: 'Flow Logs', path: '/dashboard/networking/flow-logs' }
  ];

  // Database Services
  const databaseServices = [
    { name: 'Overview', path: '/dashboard/database' },
    { name: 'Autonomous Database', path: '/dashboard/database/autonomous' },
    { name: 'Autonomous on Dedicated', path: '/dashboard/database/autonomous-dedicated' },
    { name: 'Globally Distributed DB', path: '/dashboard/database/global' },
    { name: 'Base Database Service', path: '/dashboard/database/base' },
    { name: 'Exadata Database', path: '/dashboard/database/exadata' },
    { name: 'External Database', path: '/dashboard/database/external' },
    { name: 'Database Backups', path: '/dashboard/database/backups' },
    { name: 'Database Security', path: '/dashboard/database/security' }
  ];

  // Developer Services
  const developerServices = [
    { name: 'Kubernetes Clusters', path: '/dashboard/developer/kubernetes' },
    { name: 'Container Instances', path: '/dashboard/developer/containers' },
    { name: 'Container Registry', path: '/dashboard/developer/container-registry' },
    { name: 'Artifact Registry', path: '/dashboard/developer/artifacts' },
    { name: 'Functions', path: '/dashboard/developer/functions' },
    { name: 'API Management', path: '/dashboard/developer/api' },
    { name: 'Integration', path: '/dashboard/developer/integration' },
    { name: 'Notifications', path: '/dashboard/developer/notifications' },
    { name: 'Email Delivery', path: '/dashboard/developer/email' },
    { name: 'Queues', path: '/dashboard/developer/queues' }
  ];

  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.sidebarLogo}>
            MyCloud
          </Link>
          <button
            className={styles.closeSidebarButton}
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Dashboard</div>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link
                href="/dashboard"
                className={`${styles.navLink} ${isActive('/dashboard') && !pathname.includes('/dashboard/') ? styles.navLinkActive : ''}`}
                onClick={closeSidebar}
              >
                <span className={styles.navIcon}>📊</span>
                <span className={styles.navText}>Overview</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Core Services</div>
          <ul className={styles.navList}>
            {/* Compute */}
            <li className={styles.navItem}>
              <Link
                href="#"
                className={`${styles.navLink} ${isActive('/dashboard/compute') ? styles.navLinkActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleServiceExpand('compute');
                }}
              >
                <span className={styles.navIcon}>🖥️</span>
                <span className={styles.navText}>Compute</span>
                <span className={`${styles.serviceToggle} ${expandedServices.compute ? styles.serviceToggleOpen : ''}`}>▶</span>
              </Link>
            </li>
            <div className={`${styles.serviceSubmenu} ${expandedServices.compute ? styles.serviceSubmenuOpen : ''}`}>
              {computeServices.map(service => (
                <div key={service.path} className={styles.submenuItem}>
                  <Link
                    href={service.path}
                    className={`${styles.submenuLink} ${isActive(service.path) ? styles.submenuLinkActive : ''}`}
                    onClick={closeSidebar}
                  >
                    {service.name}
                  </Link>
                </div>
              ))}
            </div>

            {/* Storage */}
            <li className={styles.navItem}>
              <Link
                href="#"
                className={`${styles.navLink} ${isActive('/dashboard/storage') ? styles.navLinkActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleServiceExpand('storage');
                }}
              >
                <span className={styles.navIcon}>💾</span>
                <span className={styles.navText}>Storage</span>
                <span className={`${styles.serviceToggle} ${expandedServices.storage ? styles.serviceToggleOpen : ''}`}>▶</span>
              </Link>
            </li>
            <div className={`${styles.serviceSubmenu} ${expandedServices.storage ? styles.serviceSubmenuOpen : ''}`}>
              {storageServices.map(service => (
                <div key={service.path} className={styles.submenuItem}>
                  <Link
                    href={service.path}
                    className={`${styles.submenuLink} ${isActive(service.path) ? styles.submenuLinkActive : ''}`}
                    onClick={closeSidebar}
                  >
                    {service.name}
                  </Link>
                </div>
              ))}
            </div>

            {/* Networking */}
            <li className={styles.navItem}>
              <Link
                href="#"
                className={`${styles.navLink} ${isActive('/dashboard/networking') ? styles.navLinkActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleServiceExpand('networking');
                }}
              >
                <span className={styles.navIcon}>🌐</span>
                <span className={styles.navText}>Networking</span>
                <span className={`${styles.serviceToggle} ${expandedServices.networking ? styles.serviceToggleOpen : ''}`}>▶</span>
              </Link>
            </li>
            <div className={`${styles.serviceSubmenu} ${expandedServices.networking ? styles.serviceSubmenuOpen : ''}`}>
              {networkingServices.map(service => (
                <div key={service.path} className={styles.submenuItem}>
                  <Link
                    href={service.path}
                    className={`${styles.submenuLink} ${isActive(service.path) ? styles.submenuLinkActive : ''}`}
                    onClick={closeSidebar}
                  >
                    {service.name}
                  </Link>
                </div>
              ))}
            </div>

            {/* Database */}
            <li className={styles.navItem}>
              <Link
                href="#"
                className={`${styles.navLink} ${isActive('/dashboard/database') ? styles.navLinkActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleServiceExpand('database');
                }}
              >
                <span className={styles.navIcon}>🗄️</span>
                <span className={styles.navText}>Database</span>
                <span className={`${styles.serviceToggle} ${expandedServices.database ? styles.serviceToggleOpen : ''}`}>▶</span>
              </Link>
            </li>
            <div className={`${styles.serviceSubmenu} ${expandedServices.database ? styles.serviceSubmenuOpen : ''}`}>
              {databaseServices.map(service => (
                <div key={service.path} className={styles.submenuItem}>
                  <Link
                    href={service.path}
                    className={`${styles.submenuLink} ${isActive(service.path) ? styles.submenuLinkActive : ''}`}
                    onClick={closeSidebar}
                  >
                    {service.name}
                  </Link>
                </div>
              ))}
            </div>
          </ul>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Developer Services</div>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link
                href="#"
                className={`${styles.navLink} ${isActive('/dashboard/developer') ? styles.navLinkActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleServiceExpand('developer');
                }}
              >
                <span className={styles.navIcon}>👨‍💻</span>
                <span className={styles.navText}>Developer Tools</span>
                <span className={`${styles.serviceToggle} ${expandedServices.developer ? styles.serviceToggleOpen : ''}`}>▶</span>
              </Link>
            </li>
            <div className={`${styles.serviceSubmenu} ${expandedServices.developer ? styles.serviceSubmenuOpen : ''}`}>
              {developerServices.map(service => (
                <div key={service.path} className={styles.submenuItem}>
                  <Link
                    href={service.path}
                    className={`${styles.submenuLink} ${isActive(service.path) ? styles.submenuLinkActive : ''}`}
                    onClick={closeSidebar}
                  >
                    {service.name}
                  </Link>
                </div>
              ))}
            </div>
          </ul>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Management</div>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link
                href="/dashboard/monitoring"
                className={`${styles.navLink} ${isActive('/dashboard/monitoring') ? styles.navLinkActive : ''}`}
                onClick={closeSidebar}
              >
                <span className={styles.navIcon}>📈</span>
                <span className={styles.navText}>Monitoring</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                href="/dashboard/security"
                className={`${styles.navLink} ${isActive('/dashboard/security') ? styles.navLinkActive : ''}`}
                onClick={closeSidebar}
              >
                <span className={styles.navIcon}>🔒</span>
                <span className={styles.navText}>Security</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                href="/dashboard/billing"
                className={`${styles.navLink} ${isActive('/dashboard/billing') ? styles.navLinkActive : ''}`}
                onClick={closeSidebar}
              >
                <span className={styles.navIcon}>💰</span>
                <span className={styles.navText}>Billing</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                href="/dashboard/support"
                className={`${styles.navLink} ${isActive('/dashboard/support') ? styles.navLinkActive : ''}`}
                onClick={closeSidebar}
              >
                <span className={styles.navIcon}>🙋</span>
                <span className={styles.navText}>Support</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      {isOpen && (
        <div className={styles.sidebarBackdrop} onClick={closeSidebar}></div>
      )}
    </>
  );
};

export default DashboardSidebar; 