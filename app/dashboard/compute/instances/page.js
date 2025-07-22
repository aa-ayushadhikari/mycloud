'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCloud } from '../../../context/CloudContext';
import styles from '../../dashboard.module.css';
import instanceStyles from './instances.module.css';

const InstancesPage = () => {
  const { 
    virtualMachines, 
    createVirtualMachine, 
    updateVMStatus, 
    deleteVM,
    resources 
  } = useCloud();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('instances');
  const [selectedShape, setSelectedShape] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'general',
    cpu: 2,
    memory: 4,
    disk: 50,
    os: 'ubuntu-22.04',
    availabilityDomain: 'us-east-1a'
  });
  const [error, setError] = useState('');

  // Available instance shapes
  const instanceShapes = [
    { 
      id: 'standard.e4',
      name: 'Standard.E4', 
      type: 'general',
      description: 'General purpose computing',
      specs: { cpu: 2, memory: 4, networkBandwidth: '1 Gbps' },
      price: '$0.0638 per hour'
    },
    { 
      id: 'standard.e8',
      name: 'Standard.E8', 
      type: 'general',
      description: 'General purpose computing',
      specs: { cpu: 4, memory: 8, networkBandwidth: '2 Gbps' },
      price: '$0.1276 per hour'
    },
    { 
      id: 'standard.e16',
      name: 'Standard.E16', 
      type: 'general',
      description: 'General purpose computing',
      specs: { cpu: 8, memory: 16, networkBandwidth: '4 Gbps' },
      price: '$0.2552 per hour'
    },
    { 
      id: 'compute.c4',
      name: 'Compute.C4', 
      type: 'compute',
      description: 'Compute-optimized instances',
      specs: { cpu: 4, memory: 4, networkBandwidth: '2 Gbps' },
      price: '$0.0898 per hour'
    },
    { 
      id: 'compute.c8',
      name: 'Compute.C8', 
      type: 'compute',
      description: 'Compute-optimized instances',
      specs: { cpu: 8, memory: 8, networkBandwidth: '4 Gbps' },
      price: '$0.1796 per hour'
    },
    { 
      id: 'memory.r16',
      name: 'Memory.R16', 
      type: 'memory',
      description: 'Memory-optimized instances',
      specs: { cpu: 2, memory: 16, networkBandwidth: '2 Gbps' },
      price: '$0.1112 per hour'
    },
    { 
      id: 'memory.r32',
      name: 'Memory.R32', 
      type: 'memory',
      description: 'Memory-optimized instances',
      specs: { cpu: 4, memory: 32, networkBandwidth: '4 Gbps' },
      price: '$0.2225 per hour'
    }
  ];

  // Operating systems
  const osSystems = [
    { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS' },
    { id: 'ubuntu-20.04', name: 'Ubuntu 20.04 LTS' },
    { id: 'debian-11', name: 'Debian 11' },
    { id: 'centos-9', name: 'CentOS 9 Stream' },
    { id: 'windows-server-2022', name: 'Windows Server 2022' },
    { id: 'windows-server-2019', name: 'Windows Server 2019' },
    { id: 'rhel-9', name: 'Red Hat Enterprise Linux 9' },
    { id: 'oracle-linux-8', name: 'Oracle Linux 8' }
  ];

  // Availability domains
  const availabilityDomains = [
    { id: 'us-east-1a', name: 'US East (Virginia) - Availability Domain 1' },
    { id: 'us-east-1b', name: 'US East (Virginia) - Availability Domain 2' },
    { id: 'us-east-1c', name: 'US East (Virginia) - Availability Domain 3' },
    { id: 'us-west-1a', name: 'US West (Oregon) - Availability Domain 1' },
    { id: 'eu-west-1a', name: 'EU West (Ireland) - Availability Domain 1' },
    { id: 'ap-east-1a', name: 'Asia Pacific (Tokyo) - Availability Domain 1' }
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
    setSelectedShape(null);
  };

  // Select shape
  const handleSelectShape = (shape) => {
    setSelectedShape(shape);
    setFormData({
      ...formData,
      type: shape.type,
      cpu: shape.specs.cpu,
      memory: shape.specs.memory
    });
  };

  // Handle VM creation
  const handleCreateVM = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.name.trim()) {
      setError('Instance name is required');
      return;
    }

    if (!selectedShape) {
      setError('Please select an instance shape');
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

    // Create VM with selected shape
    createVirtualMachine({
      name: formData.name,
      type: formData.type,
      cpu: formData.cpu,
      memory: formData.memory,
      disk: formData.disk,
      os: formData.os,
      availabilityDomain: formData.availabilityDomain,
      shape: selectedShape.id
    });

    // Reset form and close modal
    setFormData({
      name: '',
      type: 'general',
      cpu: 2,
      memory: 4,
      disk: 50,
      os: 'ubuntu-22.04',
      availabilityDomain: 'us-east-1a'
    });
    setSelectedShape(null);
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
    if (confirm('Are you sure you want to delete this instance? This action cannot be undone.')) {
      deleteVM(vmId);
    }
  };
  
  // Get formatted date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get OS name
  const getOsName = (osId) => {
    const os = osSystems.find(o => o.id === osId);
    return os ? os.name : osId;
  };

  // Get availability domain name
  const getADName = (adId) => {
    const ad = availabilityDomains.find(ad => ad.id === adId);
    return ad ? ad.name : adId;
  };

  // Get shape name
  const getShapeName = (shapeId) => {
    const shape = instanceShapes.find(s => s.id === shapeId);
    return shape ? shape.name : shapeId;
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
        <button onClick={openModal} className={styles.createButton}>
          Create Instance
        </button>
      </div>

      <div className={instanceStyles.tabs}>
        <button 
          className={`${instanceStyles.tabButton} ${activeTab === 'instances' ? instanceStyles.activeTab : ''}`}
          onClick={() => setActiveTab('instances')}
        >
          Instances
        </button>
        <button 
          className={`${instanceStyles.tabButton} ${activeTab === 'shapes' ? instanceStyles.activeTab : ''}`}
          onClick={() => setActiveTab('shapes')}
        >
          Available Shapes
        </button>
      </div>

      {/* Instances Tab */}
      {activeTab === 'instances' && (
        <>
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
                    <th>Shape</th>
                    <th>Resources</th>
                    <th>OS</th>
                    <th>Availability Domain</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {virtualMachines.map(vm => (
                    <tr key={vm.id}>
                      <td>{vm.name}</td>
                      <td>{vm.shape ? getShapeName(vm.shape) : `Custom (${vm.cpu} vCPU, ${vm.memory} GB)`}</td>
                      <td>{vm.cpu} vCPUs, {vm.memory} GB RAM</td>
                      <td>{getOsName(vm.os)}</td>
                      <td>{vm.availabilityDomain ? getADName(vm.availabilityDomain) : 'N/A'}</td>
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
                <button onClick={openModal} className={styles.createButton}>
                  Create your first instance
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Shapes Tab */}
      {activeTab === 'shapes' && (
        <div className={instanceStyles.shapesGrid}>
          {instanceShapes.map(shape => (
            <div key={shape.id} className={instanceStyles.shapeCard}>
              <div className={instanceStyles.shapeHeader}>
                <h3 className={instanceStyles.shapeName}>{shape.name}</h3>
                <span className={instanceStyles.shapeType}>{shape.type}</span>
              </div>
              <div className={instanceStyles.shapeDescription}>
                {shape.description}
              </div>
              <div className={instanceStyles.shapeSpecs}>
                <div className={instanceStyles.specItem}>
                  <span className={instanceStyles.specLabel}>vCPUs</span>
                  <span className={instanceStyles.specValue}>{shape.specs.cpu}</span>
                </div>
                <div className={instanceStyles.specItem}>
                  <span className={instanceStyles.specLabel}>Memory</span>
                  <span className={instanceStyles.specValue}>{shape.specs.memory} GB</span>
                </div>
                <div className={instanceStyles.specItem}>
                  <span className={instanceStyles.specLabel}>Network</span>
                  <span className={instanceStyles.specValue}>{shape.specs.networkBandwidth}</span>
                </div>
              </div>
              <div className={instanceStyles.shapePrice}>
                {shape.price}
              </div>
              <button 
                className={instanceStyles.shapeSelectButton}
                onClick={() => {
                  handleSelectShape(shape);
                  openModal();
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create VM Modal */}
      {isModalOpen && (
        <div className={instanceStyles.modalOverlay}>
          <div className={instanceStyles.modal}>
            <div className={instanceStyles.modalHeader}>
              <h2 className={instanceStyles.modalTitle}>Create Instance</h2>
              <button 
                className={instanceStyles.closeButton} 
                onClick={closeModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className={instanceStyles.modalContent}>
              {error && <div className={instanceStyles.errorMessage}>{error}</div>}
              
              <form onSubmit={handleCreateVM}>
                <div className={instanceStyles.formGroup}>
                  <label htmlFor="name" className={instanceStyles.label}>Instance Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={instanceStyles.input}
                    placeholder="e.g., my-web-server"
                    required
                  />
                </div>
                
                {!selectedShape ? (
                  <div className={instanceStyles.shapeSelector}>
                    <div className={instanceStyles.formGroup}>
                      <label className={instanceStyles.label}>Select Instance Shape</label>
                      <div className={instanceStyles.shapesContainer}>
                        {instanceShapes.map(shape => (
                          <div 
                            key={shape.id} 
                            className={instanceStyles.shapeOption}
                            onClick={() => handleSelectShape(shape)}
                          >
                            <div className={instanceStyles.shapeOptionHeader}>
                              <span className={instanceStyles.shapeOptionName}>{shape.name}</span>
                              <span className={instanceStyles.shapeOptionType}>{shape.type}</span>
                            </div>
                            <div className={instanceStyles.shapeOptionSpecs}>
                              {shape.specs.cpu} vCPUs, {shape.specs.memory} GB RAM
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={instanceStyles.selectedShape}>
                    <div className={instanceStyles.selectedShapeHeader}>
                      <span className={instanceStyles.label}>Selected Shape</span>
                      <button 
                        type="button" 
                        className={instanceStyles.changeShapeButton}
                        onClick={() => setSelectedShape(null)}
                      >
                        Change
                      </button>
                    </div>
                    <div className={instanceStyles.selectedShapeContent}>
                      <div className={instanceStyles.selectedShapeName}>{selectedShape.name}</div>
                      <div className={instanceStyles.selectedShapeSpecs}>
                        {selectedShape.specs.cpu} vCPUs, {selectedShape.specs.memory} GB RAM, {selectedShape.specs.networkBandwidth} Network
                      </div>
                      <div className={instanceStyles.selectedShapePrice}>{selectedShape.price}</div>
                    </div>
                  </div>
                )}
                
                <div className={instanceStyles.formGroup}>
                  <label htmlFor="os" className={instanceStyles.label}>Operating System</label>
                  <select
                    id="os"
                    name="os"
                    value={formData.os}
                    onChange={handleChange}
                    className={instanceStyles.select}
                  >
                    {osSystems.map(os => (
                      <option key={os.id} value={os.id}>
                        {os.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={instanceStyles.formGroup}>
                  <label htmlFor="availabilityDomain" className={instanceStyles.label}>Availability Domain</label>
                  <select
                    id="availabilityDomain"
                    name="availabilityDomain"
                    value={formData.availabilityDomain}
                    onChange={handleChange}
                    className={instanceStyles.select}
                  >
                    {availabilityDomains.map(ad => (
                      <option key={ad.id} value={ad.id}>
                        {ad.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={instanceStyles.formGroup}>
                  <label htmlFor="disk" className={instanceStyles.label}>
                    Boot Volume Size (GB)
                  </label>
                  <input
                    type="range"
                    id="disk"
                    name="disk"
                    min="50"
                    max="1000"
                    step="10"
                    value={formData.disk}
                    onChange={handleChange}
                    className={instanceStyles.rangeInput}
                  />
                  <div className={instanceStyles.rangeValue}>{formData.disk} GB</div>
                </div>
                
                <div className={instanceStyles.formActions}>
                  <button type="submit" className={instanceStyles.submitButton} disabled={!selectedShape}>
                    Create Instance
                  </button>
                  <button type="button" onClick={closeModal} className={instanceStyles.cancelButton}>
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

export default InstancesPage; 