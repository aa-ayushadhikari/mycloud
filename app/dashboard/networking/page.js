'use client';

import { useState } from 'react';
import { useNetworking } from '../../hooks/useNetworking';
import styles from './networking.module.css';

export default function NetworkingPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const { 
    networks, 
    loading, 
    error, 
    pagination, 
    deleteNetwork
  } = useNetworking(page, 10, filters);
  const [actionLoading, setActionLoading] = useState(false);

  const handleDeleteNetwork = async (id) => {
    if (window.confirm('Are you sure you want to delete this network? This action cannot be undone.')) {
      setActionLoading(true);
      const success = await deleteNetwork(id);
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

  if (loading && !networks.length) {
    return <div className={styles.loading}>Loading networks...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Networks</h1>
      
      <div className={styles.filters}>
        <select 
          name="type"
          onChange={handleFilterChange}
          value={filters.type || ''}
          className={styles.filterSelect}
        >
          <option value="">All Types</option>
          <option value="vpc">VPC</option>
          <option value="subnet">Subnet</option>
          <option value="security-group">Security Group</option>
        </select>

        <select 
          name="status"
          onChange={handleFilterChange}
          value={filters.status || ''}
          className={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="creating">Creating</option>
          <option value="deleting">Deleting</option>
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
          onClick={() => {/* Navigate to create network page */}}
        >
          Create Network
        </button>
      </div>
      
      {networks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No networks found. Create your first network to get started.</p>
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
                  <th>CIDR</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {networks.map(network => (
                  <tr key={network._id}>
                    <td>{network.name}</td>
                    <td>{network.type}</td>
                    <td>
                      <span className={`${styles.status} ${styles[network.status]}`}>
                        {network.status}
                      </span>
                    </td>
                    <td>{network.region}</td>
                    <td>{network.details?.cidr || '-'}</td>
                    <td className={styles.actions}>
                      <button 
                        onClick={() => {/* Navigate to network details */}}
                        className={styles.actionButton}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleDeleteNetwork(network._id)}
                        disabled={actionLoading || network.status === 'deleting'}
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