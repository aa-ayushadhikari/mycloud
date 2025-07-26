'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../../hooks/useSubscription';
import { useAllInstances } from '../../hooks/useInstances';
import { instanceService } from '../../services/instanceService';
import styles from '../dashboard.module.css';
import vmStyles from './compute.module.css';
import instanceStyles from './instances/instances.module.css';

const VirtualMachines = () => {
  const { 
    instances: virtualMachines,
    loading: vmsLoading,
    refetchInstances
  } = useAllInstances();

  const {
    userSubscription,
    loading: subscriptionLoading,
  } = useSubscription();

  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVm, setSelectedVm] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const loading = vmsLoading || subscriptionLoading;

  const quotaUsage = userSubscription?.quotaUsage || {
    compute: {
      vCpuCores: { used: 0, total: 1 },
      ramGB: { used: 0, total: 0.5 },
    },
  };
  
  const cpuUsage = quotaUsage.compute?.vCpuCores || { used: 0, total: 1 };
  const memoryUsage = quotaUsage.compute?.ramGB || { used: 0, total: 0.5 };

  const navigateToCreateInstance = () => {
    router.push('/dashboard/compute/instances?action=create');
  };

  const handleAction = async (action, vmId) => {
    try {
      await action(vmId);
      refetchInstances();
    } catch (err) {
      console.error(`Action failed for VM ${vmId}:`, err);
    }
  };
  
  const handleStartVM = (vmId) => handleAction(instanceService.startInstance, vmId);
  const handleStopVM = (vmId) => handleAction(instanceService.stopInstance, vmId);

  const openDeleteModal = (vm) => {
    setSelectedVm(vm);
    setIsDeleteModalOpen(true);
    setDeleteConfirmText('');
  };
  
  const closeDeleteModal = () => {
    setSelectedVm(null);
    setIsDeleteModalOpen(false);
    setDeleteConfirmText('');
  };
  
  const handleDeleteVM = async () => {
    if (!selectedVm) return;
    
    // Optimistically update the UI by closing the modal
    closeDeleteModal();
    
    try {
      await instanceService.terminateInstance(selectedVm._id);
      refetchInstances();
    } catch (err) {
      console.error(`Failed to delete VM ${selectedVm._id}:`, err);
      // Optionally, show a notification to the user that deletion failed
    }
  };
  
  const formatDate = (dateString) => new Date(dateString).toLocaleString();
  const getCpuCount = (vm) => vm?.specs?.cpu?.cores || vm?.cpu || '---';
  const getMemorySize = (vm) => vm?.specs?.memory || vm?.memory || '---';
  const getOsName = (vm) => vm?.os?.name || vm?.basicInfo?.os || '---';

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Virtual Machines</h2>
        <button onClick={navigateToCreateInstance} className={styles.createButton}>
          Create VM
        </button>
      </div>

      <div className={vmStyles.resourceSummary}>
        <div className={vmStyles.resourceItem}>
          <span className={vmStyles.resourceLabel}>CPU</span>
          <div className={vmStyles.resourceValue}>
            {loading ? '...' : `${cpuUsage.used} / ${cpuUsage.total}`} vCPUs
          </div>
        </div>
        <div className={vmStyles.resourceItem}>
          <span className={vmStyles.resourceLabel}>Memory</span>
          <div className={vmStyles.resourceValue}>
            {loading ? '...' : `${memoryUsage.used} / ${memoryUsage.total}`} GB
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
        
        <Link href="/dashboard/compute/clusters" className={`${vmStyles.serviceCard} ${vmStyles.disabledCard}`}>
          <div className={vmStyles.serviceIcon}>🔄</div>
          <h3 className={vmStyles.serviceTitle}>Clusters</h3>
          <p className={vmStyles.serviceDescription}>
            Deploy high-availability VM clusters for advanced workloads
          </p>
        </Link>
        
        <Link href="/dashboard/compute" className={`${vmStyles.serviceCard} ${vmStyles.disabledCard}`}>
          <div className={vmStyles.serviceIcon}>⚡</div>
          <h3 className={vmStyles.serviceTitle}>Dedicated Hosts</h3>
          <p className={vmStyles.serviceDescription}>
            Dedicated physical servers for maximum performance and isolation
          </p>
        </Link>
      </div>

      <h3 className={styles.subsectionTitle}>Recent VMs</h3>

      <div className={styles.resourceTable}>
        {loading ? (
          <div className={styles.loadingState}>Loading instances...</div>
        ) : virtualMachines.length > 0 ? (
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
                <tr key={vm._id}>
                  <td>{vm.name}</td>
                  <td>{getCpuCount(vm)} vCPUs, {getMemorySize(vm)} GB RAM</td>
                  <td>{getOsName(vm)}</td>
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
                          onClick={() => handleStopVM(vm._id)}
                          className={`${vmStyles.actionButton} ${vmStyles.stopButton}`}
                          aria-label="Stop VM"
                          title="Stop"
                        >
                          ⏹
                        </button>
                      )}
                      {vm.status === 'stopped' && (
                        <button
                          onClick={() => handleStartVM(vm._id)}
                          className={`${vmStyles.actionButton} ${vmStyles.startButton}`}
                          aria-label="Start VM"
                          title="Start"
                        >
                          ▶
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(vm)}
                        className={`${vmStyles.actionButton} ${vmStyles.deleteButton}`}
                        aria-label="Delete VM"
                        title="Delete"
                      >
                        🗑
                      </button>
                      <Link
                        href={`/dashboard/compute/instances/${vm._id}`}
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

      {isDeleteModalOpen && selectedVm && (
        <div className={instanceStyles.modalOverlay}>
          <div className={instanceStyles.modal}>
            <div className={instanceStyles.modalHeader}>
              <h3 className={instanceStyles.modalTitle}>Delete Instance</h3>
              <button className={instanceStyles.closeButton} onClick={closeDeleteModal}>✕</button>
            </div>
            <div className={instanceStyles.modalContent}>
              <p>Are you sure you want to delete <strong>{selectedVm.name}</strong>? This action cannot be undone.</p>
              <p>To confirm deletion, please type <strong>DELETE</strong> in the box below.</p>
              <input
                type="text"
                className={instanceStyles.confirmInput}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                autoFocus
              />
              <div className={instanceStyles.formActions}>
                <button className={instanceStyles.cancelButton} onClick={closeDeleteModal}>Cancel</button>
                <button 
                  className={instanceStyles.deleteButtonLarge} 
                  onClick={handleDeleteVM}
                  disabled={deleteConfirmText !== 'DELETE'}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualMachines; 