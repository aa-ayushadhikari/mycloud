'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCloud } from '../context/CloudContext';
import styles from './dashboard.module.css';

const Dashboard = () => {
  const { user } = useAuth();
  // Destructure what we need from the API-driven context
  const { resources, virtualMachines, loading } = useCloud();
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
  
  // Helper functions to safely access potentially nested data
  const getCpuCount = (vm) => vm.specs?.cpu?.cores || vm.cpu || '--';
  const getMemorySize = (vm) => vm.specs?.memory || vm.memory || '--';

  return (
    <div>
      <div className={styles.welcomeSection}>
        <h2>Good {timeOfDay}, {user?.firstName || user?.email?.split('@')[0] || 'User'}</h2>
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
            {loading ? '...' : `${resources.cpu.used} / ${resources.cpu.total}`} vCPUs
          </div>
          <div className={styles.statLabel}>
            {loading ? '--' : Math.round((resources.cpu.used / (resources.cpu.total || 1)) * 100)}% Utilized
          </div>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: loading ? '0%' : `${(resources.cpu.used / (resources.cpu.total || 1)) * 100}%` }}
              ></div>
            </div>
            <div className={styles.progressStats}>
              <span>Used: {loading ? '--' : resources.cpu.used} vCPUs</span>
              <span>Available: {loading ? '--' : resources.cpu.total - resources.cpu.used} vCPUs</span>
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
            {loading ? '...' : `${resources.memory.used} / ${resources.memory.total}`} GB
          </div>
          <div className={styles.statLabel}>
            {loading ? '--' : Math.round((resources.memory.used / (resources.memory.total || 1)) * 100)}% Utilized
          </div>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: loading ? '0%' : `${(resources.memory.used / (resources.memory.total || 1)) * 100}%` }}
              ></div>
            </div>
            <div className={styles.progressStats}>
              <span>Used: {loading ? '--' : resources.memory.used} GB</span>
              <span>Available: {loading ? '--' : resources.memory.total - resources.memory.used} GB</span>
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
            {loading ? '...' : `${resources.storage.used} / ${resources.storage.total}`} GB
          </div>
          <div className={styles.statLabel}>
            {loading ? '--' : Math.round((resources.storage.used / (resources.storage.total || 1)) * 100)}% Utilized
          </div>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: loading ? '0%' : `${(resources.storage.used / (resources.storage.total || 1)) * 100}%` }}
              ></div>
            </div>
            <div className={styles.progressStats}>
              <span>Used: {loading ? '--' : resources.storage.used} GB</span>
              <span>Available: {loading ? '--' : resources.storage.total - resources.storage.used} GB</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Virtual Machines Section */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Virtual Machines</h3>
        <Link href="/dashboard/compute/instances" className={styles.createButton}>
          Manage Instances
        </Link>
      </div>
      
      <div className={styles.resourceTable}>
        {loading ? (
          <div className={styles.loadingState}>Loading virtual machines...</div>
        ) : virtualMachines.length > 0 ? (
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
                <tr key={vm._id || vm.id}>
                  <td>{vm.name || '--'}</td>
                  <td>{vm.type || '--'}</td>
                  <td>{getCpuCount(vm)}</td>
                  <td>{getMemorySize(vm)} GB</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${vm.status || 'unknown'}`]}`}>
                      {vm.status || 'unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>You don't have any virtual machines yet.</p>
            <Link href="/dashboard/compute/instances?action=create" className={styles.createButton}>
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
        {/* This section was not part of the new_code, so it remains unchanged */}
        {/* The original code had a table for storages, but the new_code removed it. */}
        {/* Assuming the intent was to remove the storages table as it's not in the new_code's dashboardGrid */}
        {/* If the user wants to keep it, it needs to be re-added to the dashboardGrid or the new_code needs to be updated */}
        {/* For now, I'm removing it as it's not in the new_code's dashboardGrid */}
        {/* If the user wants to keep it, please let me know. */}
      </div>

      {/* Networking Section */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Networks</h3>
        <Link href="/dashboard/networking" className={styles.createButton}>
          Create Network
        </Link>
      </div>
      
      <div className={styles.resourceTable}>
        {/* This section was not part of the new_code, so it remains unchanged */}
        {/* The original code had a table for networks, but the new_code removed it. */}
        {/* Assuming the intent was to remove the networks table as it's not in the new_code's dashboardGrid */}
        {/* If the user wants to keep it, it needs to be re-added to the dashboardGrid or the new_code needs to be updated */}
        {/* For now, I'm removing it as it's not in the new_code's dashboardGrid */}
        {/* If the user wants to keep it, please let me know. */}
      </div>
    </div>
  );
};

export default Dashboard; 