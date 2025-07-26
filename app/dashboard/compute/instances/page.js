'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSubscription } from '../../../hooks/useSubscription'; // Import useSubscription
import { useAllInstances } from '../../../hooks/useInstances';
import { instanceService } from '../../../services/instanceService';
import styles from '../../dashboard.module.css';
import instanceStyles from './instances.module.css';
import CreateVMDrawer from './components/CreateVMDrawer';

const InstancesPage = () => {
  const [filter, setFilter] = useState('all');
  
  const { 
    instances: apiInstances, 
    loading: apiLoading, 
    error: apiError, 
    refetchInstances 
  } = useAllInstances({ status: filter === 'all' ? undefined : filter });
  
  const { userSubscription, loading: subscriptionLoading } = useSubscription();
  
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVm, setSelectedVm] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsDrawerOpen(true);
    }
  }, [searchParams]);
  
  const openDrawer = () => setIsDrawerOpen(true);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    refetchInstances();
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
    
    closeDeleteModal();
    try {
      await instanceService.terminateInstance(selectedVm._id || selectedVm.id);
      refetchInstances();
    } catch (err) {
      console.error('Error terminating VM:', err);
    }
  };
  
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : '---';
  };
  
  const getOsName = (vm) => {
    if (vm?.os?.name) {
      return `${vm.os.name} ${vm.os.version || ''}`.trim();
    }
    if (vm?.basicInfo?.os) {
      return vm.basicInfo.os;
    }
    if (typeof vm?.os === 'string') {
      return vm.os;
    }
    return '---';
  };

  const getCpuCount = (vm) => vm?.specs?.cpu?.cores || vm?.cpu || '---';
  const getMemorySize = (vm) => vm?.specs?.memory || vm?.memory || '---';

  const isLoading = apiLoading || subscriptionLoading;
  const displayInstances = apiInstances;
  const quotaUsage = userSubscription?.quotaUsage || {
    compute: {
      vCpuCores: { used: 0, total: 1 },
      ramGB: { used: 0, total: 0.5 },
    },
  };
  
  const cpuUsage = quotaUsage.compute?.vCpuCores || { used: 0, total: 1 };
  const memoryUsage = quotaUsage.compute?.ramGB || { used: 0, total: 0.5 };

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

      <div className={instanceStyles.resourceSummary}>
        <div className={instanceStyles.resourceItem}>
          <span className={instanceStyles.resourceLabel}>CPU</span>
          <div className={instanceStyles.resourceValue}>
            {isLoading ? '...' : `${cpuUsage.used} / ${cpuUsage.total}`} vCPUs
          </div>
          <div className={instanceStyles.progressBar}>
            <div 
              className={instanceStyles.progressFill} 
              style={{ width: isLoading ? '0%' : `${(cpuUsage.used / (cpuUsage.total || 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className={instanceStyles.resourceItem}>
          <span className={instanceStyles.resourceLabel}>Memory</span>
          <div className={instanceStyles.resourceValue}>
            {isLoading ? '...' : `${memoryUsage.used} / ${memoryUsage.total}`} GB
          </div>
          <div className={instanceStyles.progressBar}>
            <div 
              className={instanceStyles.progressFill} 
              style={{ width: isLoading ? '0%' : `${(memoryUsage.used / (memoryUsage.total || 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

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
                        onClick={() => openDeleteModal(vm)}
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

      <CreateVMDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />

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

export default InstancesPage; 