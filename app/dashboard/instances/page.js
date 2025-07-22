'use client';

import { useState } from 'react';
import { useInstances } from '../../hooks/useInstances';
import styles from './instances.module.css';

export default function InstancesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const { instances, loading, error, pagination, startInstance, stopInstance, terminateInstance } = useInstances(page, 10, filters);
  const [actionLoading, setActionLoading] = useState(false);

  const handleStartInstance = async (id) => {
    setActionLoading(true);
    const success = await startInstance(id);
    setActionLoading(false);
    if (success) {
      // Show success message
    }
  };

  const handleStopInstance = async (id) => {
    setActionLoading(true);
    const success = await stopInstance(id);
    setActionLoading(false);
    if (success) {
      // Show success message
    }
  };

  const handleTerminateInstance = async (id) => {
    if (window.confirm('Are you sure you want to terminate this instance? This action cannot be undone.')) {
      setActionLoading(true);
      const success = await terminateInstance(id);
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

  if (loading && !instances.length) {
    return <div className={styles.loading}>Loading instances...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Compute Instances</h1>
      
      <div className={styles.filters}>
        <select 
          name="status"
          onChange={handleFilterChange}
          value={filters.status || ''}
          className={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="provisioning">Provisioning</option>
          <option value="terminated">Terminated</option>
        </select>

        <select 
          name="type"
          onChange={handleFilterChange}
          value={filters.type || ''}
          className={styles.filterSelect}
        >
          <option value="">All Types</option>
          <option value="standard">Standard</option>
          <option value="compute-optimized">Compute Optimized</option>
          <option value="memory-optimized">Memory Optimized</option>
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
          onClick={() => {/* Navigate to create instance page */}}
        >
          Create Instance
        </button>
      </div>
      
      {instances.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No instances found. Create your first instance to get started.</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Region</th>
                  <th>OS</th>
                  <th>IP Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {instances.map(instance => (
                  <tr key={instance._id}>
                    <td>{instance.name}</td>
                    <td>{instance.type}</td>
                    <td>
                      <span className={`${styles.status} ${styles[instance.status]}`}>
                        {instance.status}
                      </span>
                    </td>
                    <td>{instance.region}</td>
                    <td>{instance.os?.name} {instance.os?.version}</td>
                    <td>{instance.network?.publicIp || '-'}</td>
                    <td className={styles.actions}>
                      {instance.status === 'stopped' && (
                        <button 
                          onClick={() => handleStartInstance(instance._id)}
                          disabled={actionLoading}
                          className={styles.actionButton}
                        >
                          Start
                        </button>
                      )}
                      {instance.status === 'running' && (
                        <button 
                          onClick={() => handleStopInstance(instance._id)}
                          disabled={actionLoading}
                          className={styles.actionButton}
                        >
                          Stop
                        </button>
                      )}
                      <button 
                        onClick={() => {/* Navigate to instance details */}}
                        className={styles.actionButton}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleTerminateInstance(instance._id)}
                        disabled={actionLoading || instance.status === 'terminated'}
                        className={`${styles.actionButton} ${styles.terminateButton}`}
                      >
                        Terminate
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