'use client';

import { useState } from 'react';
import { useCloud } from '../../context/CloudContext';
import styles from '../dashboard.module.css';
import vmStyles from './compute.module.css';

const VirtualMachines = () => {
  const { 
    virtualMachines, 
    createVirtualMachine, 
    updateVMStatus, 
    deleteVM,
    resources 
  } = useCloud();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'general',
    cpu: 1,
    memory: 2,
    disk: 20,
    os: 'ubuntu-20.04'
  });
  const [error, setError] = useState('');

  // VM instance types
  const vmTypes = [
    { id: 'general', name: 'General Purpose', cpuRange: [1, 4], memoryRange: [2, 16] },
    { id: 'compute', name: 'Compute Optimized', cpuRange: [2, 8], memoryRange: [2, 8] },
    { id: 'memory', name: 'Memory Optimized', cpuRange: [1, 4], memoryRange: [8, 32] },
  ];

  // Operating systems
  const osSystems = [
    { id: 'ubuntu-20.04', name: 'Ubuntu 20.04 LTS' },
    { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS' },
    { id: 'debian-11', name: 'Debian 11' },
    { id: 'centos-9', name: 'CentOS 9 Stream' },
    { id: 'windows-server-2022', name: 'Windows Server 2022' }
  ];

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // Convert numeric values
    if (name === 'cpu' || name === 'memory' || name === 'disk') {
      parsedValue = parseInt(value);
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  // Open modal
  const openModal = () => {
    setIsModalOpen(true);
    setError('');
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  // Handle VM creation
  const handleCreateVM = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.name.trim()) {
      setError('VM name is required');
      return;
    }

    // Check resource limits
    if (resources.cpu.used + formData.cpu > resources.cpu.total) {
      setError('Not enough CPU resources available');
      return;
    }

    if (resources.memory.used + formData.memory > resources.memory.total) {
      setError('Not enough memory resources available');
      return;
    }

    // Create VM
    createVirtualMachine({
      name: formData.name,
      type: formData.type,
      cpu: formData.cpu,
      memory: formData.memory,
      disk: formData.disk,
      os: formData.os
    });

    // Reset form and close modal
    setFormData({
      name: '',
      type: 'general',
      cpu: 1,
      memory: 2,
      disk: 20,
      os: 'ubuntu-20.04'
    });
    closeModal();
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

  // Get VM type name
  const getVmTypeName = (typeId) => {
    const type = vmTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  };

  // Get OS name
  const getOsName = (osId) => {
    const os = osSystems.find(o => o.id === osId);
    return os ? os.name : osId;
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Virtual Machines</h2>
        <button onClick={openModal} className={styles.createButton}>
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

      {/* VM List */}
      <div className={styles.resourceTable}>
        {virtualMachines.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
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
                  <td>{getVmTypeName(vm.type)}</td>
                  <td>{vm.cpu} vCPUs, {vm.memory} GB RAM</td>
                  <td>{getOsName(vm.os)}</td>
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
                        >
                          ⏹
                        </button>
                      )}
                      {vm.status === 'stopped' && (
                        <button
                          onClick={() => handleStartVM(vm.id)}
                          className={`${vmStyles.actionButton} ${vmStyles.startButton}`}
                          aria-label="Start VM"
                        >
                          ▶
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVM(vm.id)}
                        className={`${vmStyles.actionButton} ${vmStyles.deleteButton}`}
                        aria-label="Delete VM"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>You don't have any virtual machines yet.</p>
            <button onClick={openModal} className={styles.createButton}>
              Create your first VM
            </button>
          </div>
        )}
      </div>

      {/* Create VM Modal */}
      {isModalOpen && (
        <div className={vmStyles.modalOverlay}>
          <div className={vmStyles.modal}>
            <div className={vmStyles.modalHeader}>
              <h2 className={vmStyles.modalTitle}>Create Virtual Machine</h2>
              <button 
                className={vmStyles.closeButton} 
                onClick={closeModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className={vmStyles.modalContent}>
              {error && <div className={vmStyles.errorMessage}>{error}</div>}
              
              <form onSubmit={handleCreateVM}>
                <div className={vmStyles.formGroup}>
                  <label htmlFor="name" className={vmStyles.label}>VM Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={vmStyles.input}
                    placeholder="e.g., my-web-server"
                    required
                  />
                </div>
                
                <div className={vmStyles.formGroup}>
                  <label htmlFor="type" className={vmStyles.label}>VM Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={vmStyles.select}
                  >
                    {vmTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={vmStyles.formRow}>
                  <div className={vmStyles.formGroup}>
                    <label htmlFor="cpu" className={vmStyles.label}>vCPUs</label>
                    <select
                      id="cpu"
                      name="cpu"
                      value={formData.cpu}
                      onChange={handleChange}
                      className={vmStyles.select}
                    >
                      {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'vCPU' : 'vCPUs'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={vmStyles.formGroup}>
                    <label htmlFor="memory" className={vmStyles.label}>Memory (GB)</label>
                    <select
                      id="memory"
                      name="memory"
                      value={formData.memory}
                      onChange={handleChange}
                      className={vmStyles.select}
                    >
                      {[2, 4, 8, 16, 32].map(size => (
                        <option key={size} value={size}>
                          {size} GB
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className={vmStyles.formGroup}>
                  <label htmlFor="os" className={vmStyles.label}>Operating System</label>
                  <select
                    id="os"
                    name="os"
                    value={formData.os}
                    onChange={handleChange}
                    className={vmStyles.select}
                  >
                    {osSystems.map(os => (
                      <option key={os.id} value={os.id}>
                        {os.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={vmStyles.formGroup}>
                  <label htmlFor="disk" className={vmStyles.label}>
                    Disk Size (GB)
                  </label>
                  <input
                    type="range"
                    id="disk"
                    name="disk"
                    min="10"
                    max="1000"
                    step="10"
                    value={formData.disk}
                    onChange={handleChange}
                    className={vmStyles.rangeInput}
                  />
                  <div className={vmStyles.rangeValue}>{formData.disk} GB</div>
                </div>
                
                <div className={vmStyles.formActions}>
                  <button type="submit" className={vmStyles.submitButton}>
                    Create VM
                  </button>
                  <button type="button" onClick={closeModal} className={vmStyles.cancelButton}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualMachines; 