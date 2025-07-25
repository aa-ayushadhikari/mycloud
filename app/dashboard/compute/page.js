'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCloud } from '../../context/CloudContext';
import styles from '../dashboard.module.css';
import vmStyles from './compute.module.css';

const VirtualMachines = () => {
  const { 
    virtualMachines,
    updateVMStatus, 
    deleteVM,
    resources 
  } = useCloud();
  
  const router = useRouter();
  
  // Navigate to instances page with create action
  const navigateToCreateInstance = () => {
    router.push('/dashboard/compute/instances?action=create');
  };

  // Start VM
  const handleStartVM = (vmId) => {
    updateVMStatus(vmId, 'starting');
  };

  // Stop VM
  const handleStopVM = (vmId) => {
    updateVMStatus(vmId, 'stopping');
  };

  // Delete VM
  const handleDeleteVM = (vmId) => {
    if (confirm('Are you sure you want to delete this VM? This action cannot be undone.')) {
      deleteVM(vmId);
    }
  };
  
  // Get formatted date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Virtual Machines</h2>
        <button onClick={navigateToCreateInstance} className={styles.createButton}>
          Create VM
        </button>
      </div>

      {/* Resource summary */}
      <div className={vmStyles.resourceSummary}>
        <div className={vmStyles.resourceItem}>
          <span className={vmStyles.resourceLabel}>CPU</span>
          <div className={vmStyles.resourceValue}>
            {resources.cpu.used} / {resources.cpu.total} vCPUs
          </div>
        </div>
        <div className={vmStyles.resourceItem}>
          <span className={vmStyles.resourceLabel}>Memory</span>
          <div className={vmStyles.resourceValue}>
            {resources.memory.used} / {resources.memory.total} GB
          </div>
        </div>
      </div>

      <div className={vmStyles.serviceCards}>
        <Link href="/dashboard/compute/instances" className={vmStyles.serviceCard}>
          <div className={vmStyles.serviceIcon}>💻</div>
          <h3 className={vmStyles.serviceTitle}>Instances</h3>
          <p className={vmStyles.serviceDescription}>
            Create and manage virtual machines with your choice of OS and configuration
          </p>
        </Link>
        
        <Link href="/dashboard/compute/clusters" className={vmStyles.serviceCard}>
          <div className={vmStyles.serviceIcon}>🔄</div>
          <h3 className={vmStyles.serviceTitle}>Clusters</h3>
          <p className={vmStyles.serviceDescription}>
            Deploy high-availability VM clusters for advanced workloads
          </p>
        </Link>
        
        <Link href="/dashboard/compute" className={vmStyles.serviceCard}>
          <div className={vmStyles.serviceIcon}>⚡</div>
          <h3 className={vmStyles.serviceTitle}>Dedicated Hosts</h3>
          <p className={vmStyles.serviceDescription}>
            Dedicated physical servers for maximum performance and isolation
          </p>
        </Link>
      </div>

      <h3 className={styles.subsectionTitle}>Recent VMs</h3>

      {/* VM List */}
      <div className={styles.resourceTable}>
        {virtualMachines.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Resources</th>
                <th>OS</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {virtualMachines.slice(0, 5).map(vm => (
                <tr key={vm.id}>
                  <td>{vm.name}</td>
                  <td>{vm.cpu} vCPUs, {vm.memory} GB RAM</td>
                  <td>{vm.os}</td>
                  <td>{formatDate(vm.createdAt)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${vm.status}`]}`}>
                      {vm.status}
                    </span>
                  </td>
                  <td>
                    <div className={vmStyles.actionButtons}>
                      {vm.status === 'running' && (
                        <button
                          onClick={() => handleStopVM(vm.id)}
                          className={`${vmStyles.actionButton} ${vmStyles.stopButton}`}
                          aria-label="Stop VM"
                          title="Stop"
                        >
                          ⏹
                        </button>
                      )}
                      {vm.status === 'stopped' && (
                        <button
                          onClick={() => handleStartVM(vm.id)}
                          className={`${vmStyles.actionButton} ${vmStyles.startButton}`}
                          aria-label="Start VM"
                          title="Start"
                        >
                          ▶
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVM(vm.id)}
                        className={`${vmStyles.actionButton} ${vmStyles.deleteButton}`}
                        aria-label="Delete VM"
                        title="Delete"
                      >
                        🗑
                      </button>
                      <Link
                        href={`/dashboard/compute/instances/${vm.id}`}
                        className={`${vmStyles.actionButton} ${vmStyles.detailsButton}`}
                        aria-label="VM details"
                        title="Details"
                      >
                        ⚙️
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>You don't have any virtual machines yet.</p>
            <button onClick={navigateToCreateInstance} className={styles.createButton}>
              Create your first VM
            </button>
          </div>
        )}
      </div>
      
      {virtualMachines.length > 5 && (
        <div className={styles.viewAllContainer}>
          <Link href="/dashboard/compute/instances" className={styles.viewAllLink}>
            View all instances
          </Link>
        </div>
      )}
    </div>
  );
};

export default VirtualMachines; 