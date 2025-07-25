'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCloud } from '../../../context/CloudContext';
import styles from '../../dashboard.module.css';
import instanceStyles from './instances.module.css';
import CreateVMDrawer from './components/CreateVMDrawer';

const InstancesPage = () => {
  const { 
    virtualMachines, 
    updateVMStatus, 
    deleteVM,
    resources 
  } = useCloud();
  
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Check if drawer should be opened based on URL parameters
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsDrawerOpen(true);
    }
  }, [searchParams]);
  
  // Open drawer
  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  // Close drawer
  const closeDrawer = () => {
    setIsDrawerOpen(false);
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
    if (confirm('Are you sure you want to delete this instance? This action cannot be undone.')) {
      deleteVM(vmId);
    }
  };
  
  // Get formatted date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <div className={styles.breadcrumbs}>
        <Link href="/dashboard" className={styles.breadcrumbItem}>Dashboard</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/dashboard/compute" className={styles.breadcrumbItem}>Compute</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>Instances</span>
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Instances</h2>
        <button onClick={openDrawer} className={styles.createButton}>
          Create Instance
        </button>
      </div>

      {/* Resource summary */}
      <div className={instanceStyles.resourceSummary}>
        <div className={instanceStyles.resourceItem}>
          <span className={instanceStyles.resourceLabel}>CPU</span>
          <div className={instanceStyles.resourceValue}>
            {resources.cpu.used} / {resources.cpu.total} vCPUs
          </div>
          <div className={instanceStyles.progressBar}>
            <div 
              className={instanceStyles.progressFill} 
              style={{ width: `${(resources.cpu.used / resources.cpu.total) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className={instanceStyles.resourceItem}>
          <span className={instanceStyles.resourceLabel}>Memory</span>
          <div className={instanceStyles.resourceValue}>
            {resources.memory.used} / {resources.memory.total} GB
          </div>
          <div className={instanceStyles.progressBar}>
            <div 
              className={instanceStyles.progressFill} 
              style={{ width: `${(resources.memory.used / resources.memory.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

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
              {virtualMachines.map(vm => (
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
                    <div className={instanceStyles.actionButtons}>
                      {vm.status === 'running' && (
                        <button
                          onClick={() => handleStopVM(vm.id)}
                          className={`${instanceStyles.actionButton} ${instanceStyles.stopButton}`}
                          aria-label="Stop VM"
                          title="Stop"
                        >
                          ⏹
                        </button>
                      )}
                      {vm.status === 'stopped' && (
                        <button
                          onClick={() => handleStartVM(vm.id)}
                          className={`${instanceStyles.actionButton} ${instanceStyles.startButton}`}
                          aria-label="Start VM"
                          title="Start"
                        >
                          ▶
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVM(vm.id)}
                        className={`${instanceStyles.actionButton} ${instanceStyles.deleteButton}`}
                        aria-label="Delete VM"
                        title="Delete"
                      >
                        🗑
                      </button>
                      <Link
                        href={`/dashboard/compute/instances/${vm.id}`}
                        className={`${instanceStyles.actionButton} ${instanceStyles.detailsButton}`}
                        aria-label="Instance details"
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
            <p>You don't have any instances yet.</p>
            <button onClick={openDrawer} className={styles.createButton}>
              Create your first instance
            </button>
          </div>
        )}
      </div>

      {/* VM Creation Drawer */}
      <CreateVMDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </div>
  );
};

export default InstancesPage; 