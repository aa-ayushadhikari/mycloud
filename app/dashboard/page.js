'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCloud } from '../context/CloudContext';
import styles from './dashboard.module.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { resources, virtualMachines, storages, networks, metrics } = useCloud();
  const [timeOfDay, setTimeOfDay] = useState('');
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      setTimeOfDay('morning');
    } else if (hour < 18) {
      setTimeOfDay('afternoon');
    } else {
      setTimeOfDay('evening');
    }
  }, []);

  return (
    <div>
      <div className={styles.welcomeSection}>
        <h2>Good {timeOfDay}, {user?.name || 'User'}</h2>
        <p className={styles.welcomeDescription}>
          Welcome to your MyCloud dashboard. Here's an overview of your resources and services.
        </p>
      </div>
      
      <div className={styles.dashboardGrid}>
        {/* CPU Resource Card */}
        <div className={styles.resourceCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>CPU Usage</h3>
            <span className={styles.cardIcon}>🖥️</span>
          </div>
          
          <div className={styles.statValue}>
            {resources.cpu.used} / {resources.cpu.total} vCPUs
          </div>
          <div className={styles.statLabel}>
            {Math.round((resources.cpu.used / resources.cpu.total) * 100)}% Utilized
          </div>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${(resources.cpu.used / resources.cpu.total) * 100}%` }}
              ></div>
            </div>
            <div className={styles.progressStats}>
              <span>Used: {resources.cpu.used} vCPUs</span>
              <span>Available: {resources.cpu.total - resources.cpu.used} vCPUs</span>
            </div>
          </div>
        </div>
        
        {/* Memory Resource Card */}
        <div className={styles.resourceCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Memory Usage</h3>
            <span className={styles.cardIcon}>💾</span>
          </div>
          
          <div className={styles.statValue}>
            {resources.memory.used} / {resources.memory.total} GB
          </div>
          <div className={styles.statLabel}>
            {Math.round((resources.memory.used / resources.memory.total) * 100)}% Utilized
          </div>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${(resources.memory.used / resources.memory.total) * 100}%` }}
              ></div>
            </div>
            <div className={styles.progressStats}>
              <span>Used: {resources.memory.used} GB</span>
              <span>Available: {resources.memory.total - resources.memory.used} GB</span>
            </div>
          </div>
        </div>
        
        {/* Storage Resource Card */}
        <div className={styles.resourceCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Storage Usage</h3>
            <span className={styles.cardIcon}>💿</span>
          </div>
          
          <div className={styles.statValue}>
            {resources.storage.used} / {resources.storage.total} GB
          </div>
          <div className={styles.statLabel}>
            {Math.round((resources.storage.used / resources.storage.total) * 100)}% Utilized
          </div>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${(resources.storage.used / resources.storage.total) * 100}%` }}
              ></div>
            </div>
            <div className={styles.progressStats}>
              <span>Used: {resources.storage.used} GB</span>
              <span>Available: {resources.storage.total - resources.storage.used} GB</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Virtual Machines Section */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Virtual Machines</h3>
        <Link href="/dashboard/compute" className={styles.createButton}>
          Create VM
        </Link>
      </div>
      
      <div className={styles.resourceTable}>
        {virtualMachines.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>vCPUs</th>
                <th>Memory</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {virtualMachines.slice(0, 5).map(vm => (
                <tr key={vm.id}>
                  <td>{vm.name}</td>
                  <td>{vm.type}</td>
                  <td>{vm.cpu} vCPUs</td>
                  <td>{vm.memory} GB</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${vm.status}`]}`}>
                      {vm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>You don't have any virtual machines yet.</p>
            <Link href="/dashboard/compute" className={styles.createButton}>
              Create your first VM
            </Link>
          </div>
        )}
      </div>
      
      {/* Storage Section */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Storage</h3>
        <Link href="/dashboard/storage" className={styles.createButton}>
          Create Storage
        </Link>
      </div>
      
      <div className={styles.resourceTable}>
        {storages.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {storages.slice(0, 5).map(storage => (
                <tr key={storage.id}>
                  <td>{storage.name}</td>
                  <td>{storage.type}</td>
                  <td>{storage.size} GB</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${storage.status}`]}`}>
                      {storage.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>You don't have any storage resources yet.</p>
            <Link href="/dashboard/storage" className={styles.createButton}>
              Create your first storage
            </Link>
          </div>
        )}
      </div>

      {/* Networking Section */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Networks</h3>
        <Link href="/dashboard/networking" className={styles.createButton}>
          Create Network
        </Link>
      </div>
      
      <div className={styles.resourceTable}>
        {networks.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>CIDR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {networks.slice(0, 5).map(network => (
                <tr key={network.id}>
                  <td>{network.name}</td>
                  <td>{network.type}</td>
                  <td>{network.cidr}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${network.status}`]}`}>
                      {network.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>You don't have any networks yet.</p>
            <Link href="/dashboard/networking" className={styles.createButton}>
              Create your first network
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 