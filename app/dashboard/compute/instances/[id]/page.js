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
    try {
      await instanceService.terminateInstance(params.id);
      router.push('/dashboard/compute/instances');
    } catch (err) {
      setError('Failed to delete the VM.');
      setIsConfirmDeleteOpen(false);
    }
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
          <button onClick={() => setIsConfirmDeleteOpen(true)} className={`${instanceStyles.actionButtonLarge} ${instanceStyles.deleteButtonLarge}`}>Delete</button>
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
              <button className={instanceStyles.closeButton} onClick={() => setIsConfirmDeleteOpen(false)}>✕</button>
            </div>
            <div className={instanceStyles.modalContent}>
              <p>Are you sure you want to delete <strong>{get(vmData, 'details.basicInfo.name')}</strong>? This action cannot be undone.</p>
              <div className={instanceStyles.formActions}>
                <button className={instanceStyles.cancelButton} onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</button>
                <button className={instanceStyles.deleteButtonLarge} onClick={handleDeleteVM}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VMDetailsPage; 