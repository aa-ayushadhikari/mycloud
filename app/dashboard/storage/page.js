'use client';

import { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import styles from './storage.module.css';

export default function StoragePage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const { 
    storageVolumes, 
    loading, 
    error, 
    pagination, 
    deleteStorageVolume, 
    attachStorageVolume, 
    detachStorageVolume 
  } = useStorage(page, 10, filters);
  const [actionLoading, setActionLoading] = useState(false);

  const handleDeleteVolume = async (id) => {
    if (window.confirm('Are you sure you want to delete this storage volume? This action cannot be undone.')) {
      setActionLoading(true);
      const success = await deleteStorageVolume(id);
      setActionLoading(false);
      if (success) {
        // Show success message
      }
    }
  };

  const handleAttachVolume = async (id) => {
    // In a real app, you'd show a modal to select an instance and mount point
    const instanceId = "example-instance-id";
    const mountPoint = "/data";
    
    setActionLoading(true);
    const success = await attachStorageVolume(id, instanceId, mountPoint);
    setActionLoading(false);
    if (success) {
      // Show success message
    }
  };

  const handleDetachVolume = async (id) => {
    if (window.confirm('Are you sure you want to detach this storage volume?')) {
      setActionLoading(true);
      const success = await detachStorageVolume(id);
      setActionLoading(false);
      if (success) {
        // Show success message
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value || undefined // Remove empty filters
    }));
    setPage(1); // Reset to first page when filters change
  };

  if (loading && !storageVolumes.length) {
    return <div className={styles.loading}>Loading storage volumes...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Storage Volumes</h1>
      
      <div className={styles.filters}>
        <select 
          name="status"
          onChange={handleFilterChange}
          value={filters.status || ''}
          className={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="in-use">In Use</option>
          <option value="creating">Creating</option>
          <option value="deleting">Deleting</option>
        </select>

        <select 
          name="type"
          onChange={handleFilterChange}
          value={filters.type || ''}
          className={styles.filterSelect}
        >
          <option value="">All Types</option>
          <option value="block">Block Storage</option>
          <option value="object">Object Storage</option>
          <option value="file">File Storage</option>
        </select>

        <select 
          name="region"
          onChange={handleFilterChange}
          value={filters.region || ''}
          className={styles.filterSelect}
        >
          <option value="">All Regions</option>
          <option value="us-east-1">US East</option>
          <option value="us-west-1">US West</option>
          <option value="eu-central-1">EU Central</option>
          <option value="ap-southeast-1">Asia Pacific</option>
        </select>

        <button 
          className={styles.createButton}
          onClick={() => {/* Navigate to create storage volume page */}}
        >
          Create Volume
        </button>
      </div>
      
      {storageVolumes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No storage volumes found. Create your first volume to get started.</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size (GB)</th>
                  <th>Status</th>
                  <th>Region</th>
                  <th>Attached To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {storageVolumes.map(volume => (
                  <tr key={volume._id}>
                    <td>{volume.name}</td>
                    <td>{volume.type}</td>
                    <td>{volume.size}</td>
                    <td>
                      <span className={`${styles.status} ${styles[volume.status.replace('-', '')]}`}>
                        {volume.status}
                      </span>
                    </td>
                    <td>{volume.region}</td>
                    <td>{volume.attachedTo || '-'}</td>
                    <td className={styles.actions}>
                      {volume.status === 'available' && (
                        <button 
                          onClick={() => handleAttachVolume(volume._id)}
                          disabled={actionLoading}
                          className={styles.actionButton}
                        >
                          Attach
                        </button>
                      )}
                      {volume.status === 'in-use' && (
                        <button 
                          onClick={() => handleDetachVolume(volume._id)}
                          disabled={actionLoading}
                          className={styles.actionButton}
                        >
                          Detach
                        </button>
                      )}
                      <button 
                        onClick={() => {/* Navigate to volume details */}}
                        className={styles.actionButton}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleDeleteVolume(volume._id)}
                        disabled={actionLoading || volume.status === 'deleting'}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={styles.pagination}>
            <button 
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || loading}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button 
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages || loading}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
} 