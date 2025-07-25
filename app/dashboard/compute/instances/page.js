'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCloud } from '../../../context/CloudContext';
import { useAllInstances } from '../../../hooks/useInstances'; // Import the new hook
import { instanceService } from '../../../services/instanceService';
import styles from '../../dashboard.module.css';
import instanceStyles from './instances.module.css';
import CreateVMDrawer from './components/CreateVMDrawer';

const InstancesPage = () => {
  const [filter, setFilter] = useState('all'); // Default filter
  
  // Use the useAllInstances hook to fetch real data from the API
  const { 
    instances: apiInstances, 
    loading: apiLoading, 
    error: apiError, 
    refetchInstances 
  } = useAllInstances({ status: filter === 'all' ? undefined : filter });
  
  // Keep the CloudContext for other resource data and legacy functions
  const { resources, updateVMStatus, deleteVM } = useCloud();
  
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

  // Close drawer and refresh instances list
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // Refresh instances when drawer closes to get the latest data
    refetchInstances();
  };

  // Start VM
  const handleStartVM = (vmId) => {
    // We can optimistically update the UI while the API call is in progress
    updateVMStatus(vmId, 'starting'); 
    instanceService.startInstance(vmId)
      .then(() => refetchInstances()) // Refresh list on success
      .catch(err => console.error('Error starting VM:', err));
  };

  // Stop VM
  const handleStopVM = (vmId) => {
    updateVMStatus(vmId, 'stopping');
    instanceService.stopInstance(vmId)
      .then(() => refetchInstances()) // Refresh list on success
      .catch(err => console.error('Error stopping VM:', err));
  };

  // Delete VM
  const handleDeleteVM = (vmId) => {
    if (confirm('Are you sure you want to delete this instance? This action cannot be undone.')) {
      // Optimistically remove from context
      deleteVM(vmId); 
      instanceService.terminateInstance(vmId)
        .then(() => refetchInstances()) // Refresh list on success
        .catch(err => console.error('Error terminating VM:', err));
    }
  };
  
  // Get formatted date
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : '---';
  };
  
  // Specific helper function to get the OS name, handling multiple data structures.
  const getOsName = (vm) => {
    // Handles structure from details API: { os: { name: 'Ubuntu', version: '22.04' } }
    if (vm?.os?.name) {
      return `${vm.os.name} ${vm.os.version || ''}`.trim();
    }
    // Handles structure from list API: { basicInfo: { os: 'Windows' } }
    if (vm?.basicInfo?.os) {
      return vm.basicInfo.os;
    }
    // Handles older or inconsistent structures
    if (typeof vm?.os === 'string') {
      return vm.os;
    }
    // If no valid OS is found, return the placeholder
    return '---';
  };

  // Specific helpers for resources to ensure they also have a proper fallback
  const getCpuCount = (vm) => vm?.specs?.cpu?.cores || vm?.cpu || '---';
  const getMemorySize = (vm) => vm?.specs?.memory || vm?.memory || '---';

  // Use the API data as the primary source of truth
  const displayInstances = apiInstances;
  const isLoading = apiLoading;

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

      {/* Filter controls */}
      <div className={instanceStyles.filterControls}>
        {['all', 'running', 'stopped', 'provisioning', 'terminated'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`${instanceStyles.filterButton} ${filter === status ? instanceStyles.activeFilter : ''}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
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
        {isLoading ? (
          <div className={styles.loadingState}>Loading instances...</div>
        ) : displayInstances.length > 0 ? (
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
              {displayInstances.map(vm => (
                <tr key={vm._id || vm.id}>
                  <td>{vm.name || '---'}</td>
                  <td>{`${getCpuCount(vm)} vCPUs, ${getMemorySize(vm)} GB RAM`}</td>
                  <td>{getOsName(vm)}</td>
                  <td>{formatDate(vm.createdAt)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${vm.status || 'unknown'}`]}`}>
                      {vm.status || 'unknown'}
                    </span>
                  </td>
                  <td>
                    <div className={instanceStyles.actionButtons}>
                      {vm.status === 'running' && (
                        <button
                          onClick={() => handleStopVM(vm._id || vm.id)}
                          className={`${instanceStyles.actionButton} ${instanceStyles.stopButton}`}
                          aria-label="Stop VM"
                          title="Stop"
                        >
                          ⏹
                        </button>
                      )}
                      {vm.status === 'stopped' && (
                        <button
                          onClick={() => handleStartVM(vm._id || vm.id)}
                          className={`${instanceStyles.actionButton} ${instanceStyles.startButton}`}
                          aria-label="Start VM"
                          title="Start"
                        >
                          ▶
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVM(vm._id || vm.id)}
                        className={`${instanceStyles.actionButton} ${instanceStyles.deleteButton}`}
                        aria-label="Delete VM"
                        title="Delete"
                      >
                        🗑
                      </button>
                      <Link
                        href={`/dashboard/compute/instances/${vm._id || vm.id}`}
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