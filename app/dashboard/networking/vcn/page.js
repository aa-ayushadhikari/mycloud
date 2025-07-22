'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCloud } from '../../../context/CloudContext';
import styles from '../../dashboard.module.css';
import vcnStyles from './vcn.module.css';

const VirtualCloudNetworkPage = () => {
  const { 
    networks, 
    createNetwork,
    deleteNetwork
  } = useCloud();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cidr: '10.0.0.0/16',
    compartment: 'default',
    dnsLabel: '',
    isInternetAccessible: true,
    isIPv6Enabled: false
  });

  // Available CIDR blocks
  const cidrOptions = [
    { value: '10.0.0.0/16', label: '10.0.0.0/16 (65,536 addresses)' },
    { value: '172.16.0.0/16', label: '172.16.0.0/16 (65,536 addresses)' },
    { value: '192.168.0.0/16', label: '192.168.0.0/16 (65,536 addresses)' },
    { value: '10.0.0.0/24', label: '10.0.0.0/24 (256 addresses)' },
    { value: '172.16.0.0/24', label: '172.16.0.0/24 (256 addresses)' },
    { value: '192.168.0.0/24', label: '192.168.0.0/24 (256 addresses)' }
  ];

  // Compartment options
  const compartmentOptions = [
    { value: 'default', label: 'Default' },
    { value: 'production', label: 'Production' },
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' }
  ];

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open create modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close create modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Open detail modal
  const openDetailModal = (network) => {
    setSelectedNetwork(network);
    setIsDetailModalOpen(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setSelectedNetwork(null);
    setIsDetailModalOpen(false);
  };

  // Handle network creation
  const handleCreateNetwork = (e) => {
    e.preventDefault();
    
    // Create network
    const newNetwork = createNetwork({
      name: formData.name,
      type: 'vpc',
      cidr: formData.cidr,
      compartment: formData.compartment,
      dnsLabel: formData.dnsLabel || formData.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      isPublic: formData.isInternetAccessible,
      isIPv6Enabled: formData.isIPv6Enabled,
      subnets: [],
      securityLists: [
        {
          id: `sl_${Math.random().toString(36).substr(2, 9)}`,
          name: 'Default Security List',
          rules: [
            { type: 'ingress', protocol: 'tcp', port: 22, source: '0.0.0.0/0', description: 'SSH from anywhere' },
            { type: 'ingress', protocol: 'tcp', port: 443, source: '0.0.0.0/0', description: 'HTTPS from anywhere' },
            { type: 'egress', protocol: 'all', destination: '0.0.0.0/0', description: 'All traffic to anywhere' }
          ]
        }
      ],
      routeTables: [
        {
          id: `rt_${Math.random().toString(36).substr(2, 9)}`,
          name: 'Default Route Table',
          rules: formData.isInternetAccessible ? [
            { destination: '0.0.0.0/0', target: 'internet-gateway', description: 'Default route to internet gateway' }
          ] : []
        }
      ]
    });

    // Reset form and close modal
    setFormData({
      name: '',
      cidr: '10.0.0.0/16',
      compartment: 'default',
      dnsLabel: '',
      isInternetAccessible: true,
      isIPv6Enabled: false
    });
    closeModal();
  };

  // Handle network deletion
  const handleDeleteNetwork = (networkId) => {
    if (confirm('Are you sure you want to delete this VCN? This action cannot be undone and will delete all associated resources.')) {
      deleteNetwork(networkId);
      if (selectedNetwork && selectedNetwork.id === networkId) {
        closeDetailModal();
      }
    }
  };

  // Get compartment name
  const getCompartmentName = (compartmentId) => {
    const compartment = compartmentOptions.find(c => c.value === compartmentId);
    return compartment ? compartment.label : compartmentId;
  };

  return (
    <div>
      <div className={styles.breadcrumbs}>
        <Link href="/dashboard" className={styles.breadcrumbItem}>Dashboard</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/dashboard/networking" className={styles.breadcrumbItem}>Networking</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>Virtual Cloud Networks</span>
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Virtual Cloud Networks (VCN)</h2>
        <button onClick={openModal} className={styles.createButton}>
          Create VCN
        </button>
      </div>

      <div className={styles.serviceDescription}>
        Virtual Cloud Networks provide customizable and private cloud networks for your resources. Create isolated network environments with complete control over IP addressing, subnets, routing, and security.
      </div>

      {/* Network List */}
      <div className={styles.resourceTable}>
        {networks.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>CIDR Block</th>
                <th>Compartment</th>
                <th>Status</th>
                <th>Public</th>
                <th>IPv6</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {networks.map(network => (
                <tr key={network.id}>
                  <td>
                    <a 
                      className={vcnStyles.networkNameLink}
                      onClick={() => openDetailModal(network)}
                    >
                      {network.name}
                    </a>
                  </td>
                  <td>
                    <code className={vcnStyles.cidrCode}>{network.cidr}</code>
                  </td>
                  <td>{network.compartment ? getCompartmentName(network.compartment) : 'Default'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${network.status}`]}`}>
                      {network.status}
                    </span>
                  </td>
                  <td>
                    <span className={vcnStyles.booleanIndicator}>
                      {network.isPublic ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>
                    <span className={vcnStyles.booleanIndicator}>
                      {network.isIPv6Enabled ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>{new Date(network.createdAt).toLocaleString()}</td>
                  <td>
                    <div className={vcnStyles.actionButtons}>
                      <button
                        onClick={() => openDetailModal(network)}
                        className={`${vcnStyles.actionButton} ${vcnStyles.detailsButton}`}
                        aria-label="Network details"
                        title="Details"
                      >
                        ⚙️
                      </button>
                      <button
                        onClick={() => handleDeleteNetwork(network.id)}
                        className={`${vcnStyles.actionButton} ${vcnStyles.deleteButton}`}
                        aria-label="Delete network"
                        title="Delete"
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
            <p>You don't have any virtual cloud networks yet.</p>
            <button onClick={openModal} className={styles.createButton}>
              Create your first VCN
            </button>
          </div>
        )}
      </div>

      {/* Create VCN Modal */}
      {isModalOpen && (
        <div className={vcnStyles.modalOverlay}>
          <div className={vcnStyles.modal}>
            <div className={vcnStyles.modalHeader}>
              <h2 className={vcnStyles.modalTitle}>Create Virtual Cloud Network</h2>
              <button 
                className={vcnStyles.closeButton} 
                onClick={closeModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className={vcnStyles.modalContent}>
              <form onSubmit={handleCreateNetwork}>
                <div className={vcnStyles.formGroup}>
                  <label htmlFor="name" className={vcnStyles.label}>Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={vcnStyles.input}
                    placeholder="Enter a name for your VCN"
                    required
                  />
                </div>
                
                <div className={vcnStyles.formGroup}>
                  <label htmlFor="compartment" className={vcnStyles.label}>Compartment</label>
                  <select
                    id="compartment"
                    name="compartment"
                    value={formData.compartment}
                    onChange={handleChange}
                    className={vcnStyles.select}
                  >
                    {compartmentOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={vcnStyles.formGroup}>
                  <label htmlFor="cidr" className={vcnStyles.label}>CIDR Block</label>
                  <select
                    id="cidr"
                    name="cidr"
                    value={formData.cidr}
                    onChange={handleChange}
                    className={vcnStyles.select}
                  >
                    {cidrOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className={vcnStyles.helperText}>
                    This is the IP address range for your VCN
                  </div>
                </div>
                
                <div className={vcnStyles.formGroup}>
                  <label htmlFor="dnsLabel" className={vcnStyles.label}>DNS Label (Optional)</label>
                  <input
                    type="text"
                    id="dnsLabel"
                    name="dnsLabel"
                    value={formData.dnsLabel}
                    onChange={handleChange}
                    className={vcnStyles.input}
                    placeholder="Enter a DNS label for your VCN"
                  />
                  <div className={vcnStyles.helperText}>
                    Used to generate the default domain name. Only letters and numbers allowed.
                  </div>
                </div>
                
                <div className={vcnStyles.formGroup}>
                  <div className={vcnStyles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="isInternetAccessible"
                      name="isInternetAccessible"
                      checked={formData.isInternetAccessible}
                      onChange={handleChange}
                      className={vcnStyles.checkbox}
                    />
                    <label htmlFor="isInternetAccessible" className={vcnStyles.checkboxLabel}>
                      Create with internet connectivity
                    </label>
                  </div>
                  <div className={vcnStyles.helperText}>
                    Creates an Internet Gateway and default route table entry to enable internet access
                  </div>
                </div>
                
                <div className={vcnStyles.formGroup}>
                  <div className={vcnStyles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="isIPv6Enabled"
                      name="isIPv6Enabled"
                      checked={formData.isIPv6Enabled}
                      onChange={handleChange}
                      className={vcnStyles.checkbox}
                    />
                    <label htmlFor="isIPv6Enabled" className={vcnStyles.checkboxLabel}>
                      Enable IPv6 addressing
                    </label>
                  </div>
                  <div className={vcnStyles.helperText}>
                    Adds IPv6 CIDR block to this VCN and enables IPv6 for resources
                  </div>
                </div>
                
                <div className={vcnStyles.formActions}>
                  <button type="submit" className={vcnStyles.submitButton}>
                    Create VCN
                  </button>
                  <button type="button" onClick={closeModal} className={vcnStyles.cancelButton}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Network Detail Modal */}
      {isDetailModalOpen && selectedNetwork && (
        <div className={vcnStyles.modalOverlay}>
          <div className={`${vcnStyles.modal} ${vcnStyles.detailModal}`}>
            <div className={vcnStyles.modalHeader}>
              <h2 className={vcnStyles.modalTitle}>
                Virtual Cloud Network: {selectedNetwork.name}
              </h2>
              <button 
                className={vcnStyles.closeButton} 
                onClick={closeDetailModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className={vcnStyles.modalContent}>
              <div className={vcnStyles.networkInfo}>
                <div className={vcnStyles.infoSection}>
                  <h3 className={vcnStyles.infoSectionTitle}>Network Information</h3>
                  <div className={vcnStyles.infoGrid}>
                    <div className={vcnStyles.infoRow}>
                      <div className={vcnStyles.infoLabel}>CIDR Block</div>
                      <div className={vcnStyles.infoValue}>
                        <code className={vcnStyles.cidrCode}>{selectedNetwork.cidr}</code>
                      </div>
                    </div>
                    <div className={vcnStyles.infoRow}>
                      <div className={vcnStyles.infoLabel}>Status</div>
                      <div className={vcnStyles.infoValue}>
                        <span className={`${styles.statusBadge} ${styles[`status${selectedNetwork.status}`]}`}>
                          {selectedNetwork.status}
                        </span>
                      </div>
                    </div>
                    <div className={vcnStyles.infoRow}>
                      <div className={vcnStyles.infoLabel}>Compartment</div>
                      <div className={vcnStyles.infoValue}>
                        {selectedNetwork.compartment ? getCompartmentName(selectedNetwork.compartment) : 'Default'}
                      </div>
                    </div>
                    <div className={vcnStyles.infoRow}>
                      <div className={vcnStyles.infoLabel}>Created</div>
                      <div className={vcnStyles.infoValue}>
                        {new Date(selectedNetwork.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className={vcnStyles.infoRow}>
                      <div className={vcnStyles.infoLabel}>Public Access</div>
                      <div className={vcnStyles.infoValue}>
                        {selectedNetwork.isPublic ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <div className={vcnStyles.infoRow}>
                      <div className={vcnStyles.infoLabel}>IPv6</div>
                      <div className={vcnStyles.infoValue}>
                        {selectedNetwork.isIPv6Enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={vcnStyles.networkDiagram}>
                  <h3 className={vcnStyles.infoSectionTitle}>Network Diagram</h3>
                  <div className={vcnStyles.diagramContainer}>
                    <div className={vcnStyles.vcnBox}>
                      <div className={vcnStyles.vcnHeader}>
                        VCN: {selectedNetwork.name}
                        <div className={vcnStyles.vcnCidr}>{selectedNetwork.cidr}</div>
                      </div>
                      <div className={vcnStyles.vcnContent}>
                        {selectedNetwork.isPublic && (
                          <div className={vcnStyles.gatewayBox}>
                            <div className={vcnStyles.gatewayTitle}>Internet Gateway</div>
                            <div className={vcnStyles.internetIcon}>🌐</div>
                          </div>
                        )}

                        <div className={vcnStyles.subnetsSection}>
                          {selectedNetwork.subnets ? (
                            selectedNetwork.subnets.map(subnet => (
                              <div key={subnet.id} className={vcnStyles.subnetBox}>
                                <div className={vcnStyles.subnetTitle}>{subnet.name}</div>
                                <div className={vcnStyles.subnetCidr}>{subnet.cidr}</div>
                              </div>
                            ))
                          ) : (
                            <div className={vcnStyles.noSubnetsMessage}>
                              No subnets configured
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={vcnStyles.securitySection}>
                  <h3 className={vcnStyles.infoSectionTitle}>Security Lists</h3>
                  {selectedNetwork.securityLists ? (
                    selectedNetwork.securityLists.map(securityList => (
                      <div key={securityList.id} className={vcnStyles.securityList}>
                        <div className={vcnStyles.securityListHeader}>
                          {securityList.name}
                        </div>
                        <div className={vcnStyles.rulesTable}>
                          <table className={vcnStyles.rulesTableContent}>
                            <thead>
                              <tr>
                                <th>Type</th>
                                <th>Protocol</th>
                                <th>Source/Destination</th>
                                <th>Port/Type</th>
                                <th>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {securityList.rules.map((rule, index) => (
                                <tr key={index}>
                                  <td>
                                    <span className={`${vcnStyles.ruleBadge} ${vcnStyles[`${rule.type}Badge`]}`}>
                                      {rule.type}
                                    </span>
                                  </td>
                                  <td>{rule.protocol}</td>
                                  <td>
                                    <code className={vcnStyles.networkCode}>
                                      {rule.type === 'ingress' ? rule.source : rule.destination}
                                    </code>
                                  </td>
                                  <td>{rule.port || 'All'}</td>
                                  <td>{rule.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={vcnStyles.emptySecurityMessage}>
                      No security lists configured
                    </div>
                  )}
                </div>

                <div className={vcnStyles.actionButtons}>
                  <Link href={`/dashboard/networking/vcn/${selectedNetwork.id}/subnets`} className={vcnStyles.actionLink}>
                    Manage Subnets
                  </Link>
                  <Link href={`/dashboard/networking/vcn/${selectedNetwork.id}/security`} className={vcnStyles.actionLink}>
                    Manage Security
                  </Link>
                  <button 
                    onClick={() => handleDeleteNetwork(selectedNetwork.id)}
                    className={vcnStyles.deleteNetworkButton}
                  >
                    Delete VCN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualCloudNetworkPage; 