'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../dashboard.module.css';
import instanceStyles from '../instances.module.css';
import { instanceService } from '../../../../services/instanceService';

const VMDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  
  // State to hold all data fetched from the API, separated by source
  const [vmData, setVmData] = useState({
    details: null,
    networking: null,
    storage: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Fetch all VM data from the various API endpoints
  const fetchAllVmData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [detailsResult, networkingResult, storageResult] = await Promise.allSettled([
        instanceService.getVmDetails(params.id),
        instanceService.getVmNetworking(params.id),
        instanceService.getVmStorage(params.id),
      ]);

      setVmData({
        details: detailsResult.status === 'fulfilled' ? detailsResult.value.vm : null,
        networking: networkingResult.status === 'fulfilled' ? networkingResult.value.networking : null,
        storage: storageResult.status === 'fulfilled' ? storageResult.value.storage : null,
      });

      // If the main details call failed, we can't proceed.
      if (detailsResult.status === 'rejected') {
        throw new Error('Failed to load essential VM details.');
      }

    } catch (err) {
      console.error('Error fetching VM data:', err);
      setError('Failed to load VM details. The instance may not exist or there was a network error.');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchAllVmData();
  }, [fetchAllVmData]);

  // Handle VM Actions
  const handleVmAction = async (action, vmId) => {
    try {
      await action(vmId);
      fetchAllVmData(); 
    } catch (err) {
      setError(`Failed to perform action. Please try again.`);
    }
  };

  const handleStartVM = () => handleVmAction(instanceService.startInstance, params.id);
  const handleStopVM = () => handleVmAction(instanceService.stopInstance, params.id);
  const handleDeleteVM = async () => {
    // Immediately redirect and don't block the UI
    router.push('/dashboard/compute/instances');
    
    // Perform the deletion in the background
    try {
      await instanceService.terminateInstance(params.id);
      // No need to do anything here since we've already redirected
    } catch (err) {
      // If the deletion fails, the instance will remain in the list.
      // The user will see it's still there, and can try again.
      // We could add a more robust notification system here in the future.
      console.error('Failed to delete the VM in the background:', err);
    }
  };

  const handleOpenDeleteModal = () => {
    setDeleteConfirmText('');
    setIsConfirmDeleteOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsConfirmDeleteOpen(false);
    setDeleteConfirmText('');
  };

  // Helper functions
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : '---';
  const get = (obj, path, fallback = '---') => {
    const keys = Array.isArray(path) ? path : path.split('.');
    const result = keys.reduce((acc, key) => (acc && acc[key] != null) ? acc[key] : undefined, obj);
    return result ?? fallback;
  };

  if (isLoading) return <div className={styles.loadingContainer}><div className={styles.loader}></div></div>;
  if (error) return <div className={instanceStyles.errorNotification}><p>{error}</p></div>;
  if (!vmData.details) return <div>VM not found or could not be loaded.</div>;

  return (
    <div>
      {/* Header and Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <Link href="/dashboard/compute/instances" className={styles.breadcrumbItem}>Instances</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{get(vmData, 'details.basicInfo.name')}</span>
      </div>
      <div className={`${styles.serviceDetailHeader} ${instanceStyles.vmDetailHeader}`}>
        <div className={instanceStyles.vmTitleContainer}>
          <h1 className={instanceStyles.vmDetailTitle}>{get(vmData, 'details.basicInfo.name')}</h1>
          <span className={`${styles.statusBadge} ${styles[`status${get(vmData, 'details.basicInfo.status', 'unknown')}`]}`}>
            {get(vmData, 'details.basicInfo.status', 'unknown')}
          </span>
        </div>
        <div className={instanceStyles.vmActions}>
          {get(vmData, 'details.basicInfo.status') === 'running' && (
            <button onClick={handleStopVM} className={`${instanceStyles.actionButtonLarge} ${instanceStyles.stopButton}`}>Stop</button>
          )}
          {get(vmData, 'details.basicInfo.status') === 'stopped' && (
            <button onClick={handleStartVM} className={`${instanceStyles.actionButtonLarge} ${instanceStyles.startButton}`}>Start</button>
          )}
          <button onClick={handleOpenDeleteModal} className={`${instanceStyles.actionButtonLarge} ${instanceStyles.deleteButtonLarge}`}>Delete</button>
        </div>
      </div>

      {/* VM Details Grid */}
      <div className={instanceStyles.vmDetailsGrid}>
        {/* Essentials Section */}
        <div className={instanceStyles.vmDetailSection}>
          <h3 className={instanceStyles.sectionTitle}>Essentials</h3>
          <div className={instanceStyles.detailsTable}>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>Status</div><div className={instanceStyles.detailValue}>{get(vmData, 'details.basicInfo.status', 'unknown')}</div></div>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>Location</div><div className={instanceStyles.detailValue}>{get(vmData, 'details.location.region')}</div></div>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>Time created</div><div className={instanceStyles.detailValue}>{formatDate(get(vmData, 'details.basicInfo.createdAt'))}</div></div>
          </div>
        </div>

        {/* Properties Section */}
        <div className={instanceStyles.vmDetailSection}>
          <h3 className={instanceStyles.sectionTitle}>Virtual machine</h3>
          <div className={instanceStyles.detailsTable}>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>Computer name</div><div className={instanceStyles.detailValue}>{get(vmData, 'details.basicInfo.name')}</div></div>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>Operating system</div><div className={instanceStyles.detailValue}>{`${get(vmData, 'details.os.name')} ${get(vmData, 'details.os.version', '')}`}</div></div>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>Size</div><div className={instanceStyles.detailValue}>{`${get(vmData, 'details.resources.cpu.cores')} vCPUs, ${get(vmData, 'details.resources.memory.sizeGB')} GB memory`}</div></div>
          </div>
        </div>

        {/* Networking Section */}
        <div className={instanceStyles.vmDetailSection}>
          <h3 className={instanceStyles.sectionTitle}>Networking</h3>
          <div className={instanceStyles.detailsTable}>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>Public IP address</div><div className={instanceStyles.detailValue}>{get(vmData, 'networking.publicIp')}</div></div>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>Private IP address</div><div className={instanceStyles.detailValue}>{get(vmData, 'networking.privateIp')}</div></div>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>DNS name</div><div className={instanceStyles.detailValue}>{get(vmData, 'networking.dnsConfiguration.hostname')}</div></div>
          </div>
        </div>

        {/* Storage Section */}
        <div className={instanceStyles.vmDetailSection}>
          <h3 className={instanceStyles.sectionTitle}>Storage</h3>
          <div className={instanceStyles.detailsTable}>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>OS disk</div><div className={instanceStyles.detailValue}>{`${get(vmData, 'storage.osDisk.name')} (${get(vmData, 'storage.osDisk.sizeGB')}GB)`}</div></div>
            <div className={instanceStyles.detailRow}><div className={instanceStyles.detailLabel}>Disk encryption</div><div className={instanceStyles.detailValue}>{get(vmData, 'storage.encryption.enabled') ? 'Enabled' : 'Disabled'}</div></div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div className={instanceStyles.modalOverlay}>
          <div className={instanceStyles.modal}>
            <div className={instanceStyles.modalHeader}>
              <h3 className={instanceStyles.modalTitle}>Delete Instance</h3>
              <button className={instanceStyles.closeButton} onClick={handleCloseDeleteModal}>✕</button>
            </div>
            <div className={instanceStyles.modalContent}>
              <p>Are you sure you want to delete <strong>{get(vmData, 'details.basicInfo.name')}</strong>? This action cannot be undone.</p>
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
                <button className={instanceStyles.cancelButton} onClick={handleCloseDeleteModal}>Cancel</button>
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

export default VMDetailsPage; 