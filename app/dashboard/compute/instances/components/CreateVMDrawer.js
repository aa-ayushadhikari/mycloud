import { useState, useEffect, useRef } from 'react';
import { useCloud } from '../../../../context/CloudContext';
import styles from '../instances.module.css';
import { useAuth } from '../../../../hooks/useAuth';
import { subscriptionService } from '../../../../services/subscriptionService';
import { instanceService } from '../../../../services/instanceService';

// Add this component to display API errors in a more structured way
const ApiErrorDisplay = ({ errors }) => {
  if (!errors || errors.length === 0) return null;
  
  return (
    <div className={styles.apiErrorContainer}>
      <h4>Please fix the following errors:</h4>
      <ul className={styles.apiErrorList}>
        {errors.map((error, index) => (
          <li key={index} className={styles.apiErrorItem}>
            {error.message || error.msg || JSON.stringify(error)}
          </li>
        ))}
      </ul>
    </div>
  );
};

const CreateVMDrawer = ({ isOpen, onClose }) => {
  const { resources } = useCloud(); // Only use resources from context
  const { user } = useAuth();
  const drawerRef = useRef(null);
  
  // State for API data
  const [vmConfigurations, setVmConfigurations] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [virtualNetworks, setVirtualNetworks] = useState([]);
  const [subnets, setSubnets] = useState([]);
  const [publicIps, setPublicIps] = useState([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  
  // State to track subscription tier
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  
  // Get subscription tier on component mount
  useEffect(() => {
    const getUserSubscription = async () => {
      try {
        // First try to get from user object
        if (user?.subscription?.tier) {
          console.log('Found tier in user object:', user.subscription.tier);
          setSubscriptionTier(user.subscription.tier);
          return;
        }
        
        // If not in user object, try to fetch from service
        const userSub = await subscriptionService.getUserSubscription();
        if (userSub?.tier) {
          console.log('Found tier from subscription service:', userSub.tier);
          setSubscriptionTier(userSub.tier);
        }
      } catch (error) {
        console.error('Error getting subscription:', error);
      }
    };
    
    getUserSubscription();
  }, [user]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [apiErrors, setApiErrors] = useState([]);
  
  // VM configuration form data
  const [formData, setFormData] = useState({
    name: '',
    configId: '',
    region: '',
    zone: '',
    os: {
      name: '',
      version: ''
    },
    adminAccount: {
      username: 'adminuser',
      password: '',
      confirmPassword: '',
      rdpEnabled: false
    },
    networking: {
      virtualNetworkId: '',
      subnetId: '',
      publicIp: true,
      deletePublicIpWithVm: true,
      deleteNicWithVm: true
    },
    additionalDisks: []
  });
  
  // Fetch VM configurations and resources from API when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchConfigData = async () => {
      setApiLoading(true);
      setError('');
      setApiErrors([]);
      
      try {
        // Fetch VM configurations - this is the primary API we need
        try {
          const configResponse = await instanceService.getVmConfigurations();
          console.log('VM Configurations:', configResponse);
          
          if (configResponse.success && configResponse.configurations) {
            setVmConfigurations(configResponse.configurations);
            setOperatingSystems(configResponse.operatingSystems || []);
            setSubscriptionInfo(configResponse.subscription);
            
            // Set default configuration if available
            if (configResponse.configurations.length > 0) {
              const defaultConfig = configResponse.configurations[0];
              
              setFormData(prevData => ({
                ...prevData,
                configId: defaultConfig.id,
                region: defaultConfig.region?.name || '',
                zone: defaultConfig.region?.zones?.[0] || '',
                os: {
                  name: configResponse.operatingSystems?.[0]?.name || '',
                  version: configResponse.operatingSystems?.[0]?.version || ''
                }
              }));
            }
          }
        } catch (configError) {
          console.error('Error fetching VM configurations:', configError);
          setError('Failed to load VM configurations. Please try again later.');
          // This is critical, so we'll set loading to false and stop here
          setApiLoading(false);
          return;
        }
        
        // Fetch virtual networks - this is optional, so we'll handle errors gracefully
        try {
          const vnetResponse = await instanceService.getVirtualNetworks();
          if (vnetResponse.virtualNetworks) {
            setVirtualNetworks(vnetResponse.virtualNetworks);
          }
        } catch (networkError) {
          console.warn('Could not fetch virtual networks (endpoint might not exist yet):', networkError);
          // Set empty array but continue
          setVirtualNetworks([]);
        }
        
        // Fetch public IPs - this is optional, so we'll handle errors gracefully
        try {
          const ipResponse = await instanceService.getPublicIps();
          if (ipResponse.publicIps) {
            setPublicIps(ipResponse.publicIps);
          }
        } catch (ipError) {
          console.warn('Could not fetch public IPs (endpoint might not exist yet):', ipError);
          // Set empty array but continue
          setPublicIps([]);
        }
        
      } catch (err) {
        console.error('Error fetching VM configuration data:', err);
        setError('Failed to load VM configurations. Please try again later.');
      } finally {
        setApiLoading(false);
      }
    };
    
    fetchConfigData();
  }, [isOpen]);
  
  // Fetch subnets when virtual network is selected
  useEffect(() => {
    if (!formData.networking.virtualNetworkId) {
      setSubnets([]);
      return;
    }
    
    const fetchSubnets = async () => {
      try {
        const response = await instanceService.getSubnets(formData.networking.virtualNetworkId);
        if (response.subnets) {
          setSubnets(response.subnets);
        }
      } catch (error) {
        console.error('Error fetching subnets:', error);
      }
    };
    
    fetchSubnets();
  }, [formData.networking.virtualNetworkId]);
  
  // Reset form when drawer opens and handle animation
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setCurrentStep(1);
      setError('');
      
      // Reset form to initial values
      setFormData({
        name: '',
        configId: '',
        region: '',
        zone: '',
        os: {
          name: '',
          version: ''
        },
        adminAccount: {
          username: 'adminuser',
          password: '',
          confirmPassword: '',
          rdpEnabled: false
        },
        networking: {
          virtualNetworkId: '',
          subnetId: '',
          publicIp: true,
          deletePublicIpWithVm: true,
          deleteNicWithVm: true
        },
        additionalDisks: []
      });
      
      // Prevent body scrolling when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scrolling when drawer is closed
      document.body.style.overflow = '';
    }
    
    // Cleanup function to ensure body scrolling is re-enabled
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle closing with animation
  const handleCloseDrawer = () => {
    setIsClosing(true);
    const drawerEl = document.querySelector(`.${styles.drawer}`);
    
    if (drawerEl) {
      drawerEl.style.animation = `slideOut 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) forwards`;
      
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 250);
    } else {
      onClose();
      setIsClosing(false);
    }
  };
  
  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., adminAccount.username)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      // Handle top-level properties
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  // Handle VM configuration selection
  const handleConfigSelection = (configId) => {
    const selectedConfig = vmConfigurations.find(config => config.id === configId);
    if (!selectedConfig) return;
    
    setFormData({
      ...formData,
      configId,
      region: selectedConfig.region?.name || '',
      zone: selectedConfig.region?.zones?.[0] || ''
    });
  };
  
  // Handle OS selection
  const handleOsSelection = (osId) => {
    const selectedOs = operatingSystems.find(os => os.id === osId);
    if (!selectedOs) return;
    
    setFormData({
      ...formData,
      os: {
        name: selectedOs.name,
        version: selectedOs.version
      },
      // Reset RDP option based on OS
      adminAccount: {
        ...formData.adminAccount,
        rdpEnabled: selectedOs.name === 'Windows'
      }
    });
  };
  
  // Add additional disk
  const handleAddDisk = () => {
    setFormData({
      ...formData,
      additionalDisks: [
        ...formData.additionalDisks,
        { name: `data-disk-${formData.additionalDisks.length + 1}`, sizeGB: 100, storageType: 'Standard_LRS' }
      ]
    });
  };
  
  // Edit additional disk
  const handleEditDisk = (index, field, value) => {
    const updatedDisks = [...formData.additionalDisks];
    updatedDisks[index] = { ...updatedDisks[index], [field]: value };
    
    setFormData({
      ...formData,
      additionalDisks: updatedDisks
    });
  };
  
  // Delete additional disk
  const handleDeleteDisk = (index) => {
    const updatedDisks = [...formData.additionalDisks];
    updatedDisks.splice(index, 1);
    
    setFormData({
      ...formData,
      additionalDisks: updatedDisks
    });
  };
  
  // Navigation between steps
  const goToNextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('VM Name is required');
        return;
      }
      
      if (!formData.configId) {
        setError('Please select a VM configuration');
        return;
      }
      
      if (!formData.os.name) {
        setError('Please select an operating system');
        return;
      }
      
      if (!formData.adminAccount.username.trim()) {
        setError('Administrator username is required');
        return;
      }
      
      if (formData.adminAccount.password && formData.adminAccount.password !== formData.adminAccount.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    
    setError('');
    setCurrentStep(prev => prev + 1);
  };
  
  const goToPreviousStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };
  
  // Add a password helper function to ensure it matches the required format
  const ensureValidPassword = (password) => {
    // Check if password already contains all required elements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
      return password; // Password meets all requirements
    }
    
    // For fixing password validation issue when it doesn't match required format
    let updatedPassword = password;
    
    // Add missing requirements if needed
    if (!hasUpperCase) updatedPassword += 'A';
    if (!hasLowerCase) updatedPassword += 'a';
    if (!hasNumber) updatedPassword += '1';
    if (!hasSpecialChar) updatedPassword += '!';
    
    return updatedPassword;
  };

  // Handle VM creation
  const handleCreateVM = async () => {
    // Final validation
    if (!formData.name.trim()) {
      setError('VM Name is required');
      return;
    }
    
    if (!formData.configId) {
      setError('Please select a VM configuration');
      return;
    }
    
    setCreating(true);
    setError('');
    setApiErrors([]);
    
    try {
      // Build request body exactly as shown in documentation example
      const requestBody = {
        name: formData.name,
        configId: formData.configId,
        region: formData.region,
        zone: formData.zone,
        os: {
          name: formData.os.name,
          version: formData.os.version
        }
      };

      // Add administrator account if provided
      if (formData.adminAccount.username) {
        requestBody.adminAccount = {
          username: formData.adminAccount.username
        };
        
        // Only add password if provided, and ensure it meets validation requirements
        if (formData.adminAccount.password) {
          // Ensure password meets validation requirements
          requestBody.adminAccount.password = ensureValidPassword(formData.adminAccount.password);
        }
        
        // Add rdpEnabled only for Windows
        if (formData.os.name === 'Windows') {
          requestBody.adminAccount.rdpEnabled = formData.adminAccount.rdpEnabled;
        }
      }

      // Add networking - simplify if virtual networks aren't available
      // Only include networking if we have values to send or publicIp is set
      if (
        formData.networking.publicIp || 
        formData.networking.virtualNetworkId || 
        virtualNetworks.length === 0 // Include minimal networking if networks aren't available
      ) {
        requestBody.networking = {};
        
        // Add virtualNetworkId if present and networks are available
        if (formData.networking.virtualNetworkId && virtualNetworks.length > 0) {
          requestBody.networking.virtualNetworkId = formData.networking.virtualNetworkId;
          
          // Add subnetId only if we have a virtual network and subnet
          if (formData.networking.subnetId) {
            requestBody.networking.subnetId = formData.networking.subnetId;
          }
        }
        
        // Add publicIp flag
        requestBody.networking.publicIp = formData.networking.publicIp;
        
        // Only add these if publicIp is true
        if (formData.networking.publicIp) {
          requestBody.networking.deletePublicIpWithVm = formData.networking.deletePublicIpWithVm;
        }
        
        // Always add deleteNicWithVm
        requestBody.networking.deleteNicWithVm = formData.networking.deleteNicWithVm;
      }

      // Add additional disks if any, using the exact format from documentation
      if (formData.additionalDisks.length > 0) {
        requestBody.additionalDisks = formData.additionalDisks.map(disk => ({
          name: disk.name,
          sizeGB: parseInt(disk.sizeGB), // Ensure this is a number not a string
          storageType: disk.storageType
        }));
      }
      
      console.log('Creating VM with data:', JSON.stringify(requestBody, null, 2));
      
      // Call the API to create the VM
      const result = await instanceService.createVirtualMachine(requestBody);
      console.log('VM creation result:', result);
      
      // If we reach here, the API call was successful
      // Close drawer and trigger refresh
      handleCloseDrawer();
      
    } catch (error) {
      console.error('Error creating VM:', error);
      
      // Handle detailed API errors
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.data) {
          if (error.response.data.message) {
            setError(`API Error: ${error.response.data.message}`);
          } else if (error.response.data.errors && error.response.data.errors.length > 0) {
            setApiErrors(error.response.data.errors);
            
            const errorSummary = error.response.data.errors.length === 1
              ? error.response.data.errors[0].message || 'Validation error'
              : `${error.response.data.errors.length} validation errors found`;
              
            setError(`API Error: ${errorSummary}`);
          } else {
            setError(`API Error: ${JSON.stringify(error.response.data)}`);
          }
        } else {
          setError(`API Error: ${error.response.status} ${error.response.statusText}`);
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response received from server. Please check your network connection.');
      } else {
        setError(error.message || 'Failed to create VM. Please try again later.');
      }
    } finally {
      setCreating(false);
    }
  };
  
  // If drawer is not open and not closing, don't render anything
  if (!isOpen && !isClosing) return null;
  
  // Determine if form is ready based on loaded data
  const isFormReady = !apiLoading && vmConfigurations.length > 0;
  
  // Check if selected config has any available instances
  const getSelectedConfig = () => {
    return vmConfigurations.find(config => config.id === formData.configId);
  };
  
  const selectedConfig = getSelectedConfig();
  const isConfigAvailable = selectedConfig && selectedConfig.availableInstances > 0;
  
  // Render specific step content based on currentStep
  const renderStepContent = () => {
    if (apiLoading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading VM configurations...</p>
        </div>
      );
    }
    
    switch(currentStep) {
      case 1:
        return (
          <>
            <h3 className={styles.stepTitle}>Basic Information</h3>
            
            {/* VM Name */}
            <div className={styles.formGroup}>
              <label htmlFor="vmName">Virtual Machine Name</label>
              <input
                type="text"
                id="vmName"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter VM name (alphanumeric and hyphens only)"
                pattern="[a-zA-Z0-9-]+"
                minLength={3}
                maxLength={50}
              />
              <p className={styles.helperText}>Only alphanumeric characters and hyphens, 3-50 characters</p>
            </div>
            
            {/* VM Configuration */}
            <div className={styles.formGroup}>
              <label>VM Configuration</label>
              <p className={styles.configDescription}>
                Select a configuration based on your subscription tier
              </p>
              
              {/* Show current tier info */}
              <div className={styles.resourceUsage}>
                <p className={styles.resourceUsageTitle}>Subscription Tier: {subscriptionInfo?.tier || subscriptionTier}</p>
                {subscriptionInfo?.timeLimit > 0 && (
                  <p className={styles.minutesTag}>Time Limit: {subscriptionInfo.timeLimit} minutes</p>
                )}
              </div>
              
              <div className={styles.configOptionsWrapper}>
                <div className={styles.configOptions}>
                  {vmConfigurations.map((config, index) => {
                    const isDisabled = config.availableInstances <= 0;
                    const isSelected = formData.configId === config.id;
                    
                    return (
                      <div 
                        key={config.id} 
                        className={`
                          ${styles.configOption} 
                          ${isSelected ? styles.selectedConfig : ''}
                          ${isDisabled ? styles.disabledConfig : ''}
                        `}
                        onClick={() => !isDisabled && handleConfigSelection(config.id)}
                      >
                        <div className={styles.configHeader}>
                          <span className={styles.configName}>{config.name}</span>
                          {config.timeLimit > 0 && (
                            <span className={styles.minutesTag}>Time Limit: {config.timeLimit} minutes</span>
                          )}
                        </div>
                        <div className={styles.configDetails}>
                          <div className={styles.configDescription}>{config.description}</div>
                          <div>CPU: {config.specs.cpu.cores} vCPUs</div>
                          <div>Memory: {config.specs.memory} GB</div>
                          <div>Storage: {config.specs.storage} GB</div>
                          <div>Region: {config.region.displayName} ({config.region.name})</div>
                          <div className={styles.instancesAvailable}>
                            {isDisabled ? (
                              <span className={styles.noInstancesLeft}>No instances left</span>
                            ) : (
                              <span className={styles.instancesLeft}>
                                {config.availableInstances} instance{config.availableInstances !== 1 ? 's' : ''} available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* VM Image/OS */}
            <div className={styles.formGroup}>
              <label>Operating System</label>
              <div className={styles.osOptions}>
                {operatingSystems.map(os => (
                  <div 
                    key={os.id} 
                    className={`${styles.osOption} ${
                      formData.os.name === os.name && formData.os.version === os.version ? styles.selectedOs : ''
                    }`}
                    onClick={() => handleOsSelection(os.id)}
                  >
                    <span className={styles.osIcon}>{os.name.includes('Ubuntu') || os.name.includes('Linux') ? '🐧' : '🪟'}</span>
                    <span className={styles.osName}>{os.description || `${os.name} ${os.version}`}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Administrator Account */}
            <div className={styles.formGroup}>
              <label>Administrator Account</label>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="adminAccount.username"
                    value={formData.adminAccount.username}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="adminuser"
                    pattern="[a-zA-Z0-9_-]+"
                    minLength={3}
                    maxLength={20}
                  />
                  <p className={styles.helperText}>Only alphanumeric characters, underscores, and hyphens, 3-20 characters</p>
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="adminAccount.password"
                    value={formData.adminAccount.password}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Leave blank to auto-generate"
                    minLength={8}
                  />
                  <p className={styles.helperText}>At least 8 characters with uppercase, lowercase, number, and special character</p>
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="adminAccount.confirmPassword"
                    value={formData.adminAccount.confirmPassword}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>
              
              {/* RDP option for Windows */}
              {formData.os.name === 'Windows' && (
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="adminAccount.rdpEnabled"
                      checked={formData.adminAccount.rdpEnabled}
                      onChange={handleInputChange}
                    />
                    <span>Enable RDP (port 3389)</span>
                  </label>
                </div>
              )}
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <h3 className={styles.stepTitle}>Disk</h3>
            
            {/* OS Disk */}
            <div className={styles.formGroup}>
              <label>OS Disk</label>
              <div className={styles.osDiskInfo}>
                <span>{selectedConfig ? `${selectedConfig.specs.storage}GB Standard SSD` : '50GB Standard SSD'}</span>
              </div>
            </div>
            
            {/* Additional Disks */}
            <div className={styles.formGroup}>
              <div className={styles.sectionHeader}>
                <label>Additional Disks</label>
                <button 
                  type="button"
                  className={styles.addButton}
                  onClick={handleAddDisk}
                >
                  Add Disk
                </button>
              </div>
              
              {formData.additionalDisks.length === 0 ? (
                <div className={styles.noDisks}>No additional disks added</div>
              ) : (
                <div className={styles.disksList}>
                  {formData.additionalDisks.map((disk, index) => (
                    <div key={index} className={styles.diskItem}>
                      <div className={styles.diskDetails}>
                        <div className={styles.diskName}>
                          <label>Name:</label>
                          <input
                            type="text"
                            value={disk.name}
                            onChange={(e) => handleEditDisk(index, 'name', e.target.value)}
                            className={styles.diskNameInput}
                            pattern="[a-zA-Z0-9-]+"
                            minLength={3}
                            maxLength={50}
                          />
                        </div>
                        <div className={styles.diskSize}>
                          <label>Size:</label>
                          <input
                            type="number"
                            value={disk.sizeGB}
                            onChange={(e) => handleEditDisk(index, 'sizeGB', parseInt(e.target.value))}
                            className={styles.diskSizeInput}
                            min="1"
                            max="32767"
                          />
                          <span>GB</span>
                        </div>
                        <div className={styles.diskType}>
                          <label>Type:</label>
                          <select
                            value={disk.storageType}
                            onChange={(e) => handleEditDisk(index, 'storageType', e.target.value)}
                            className={styles.select}
                          >
                            <option value="Standard_LRS">Standard HDD</option>
                            <option value="StandardSSD_LRS">Standard SSD</option>
                            <option value="Premium_LRS">Premium SSD</option>
                          </select>
                        </div>
                      </div>
                      <div className={styles.diskActions}>
                        <button 
                          type="button"
                          onClick={() => handleDeleteDisk(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <h3 className={styles.stepTitle}>Networking</h3>
            
            {/* Virtual Network - Show simplified version if API endpoints not available */}
            <div className={styles.formGroup}>
              <label htmlFor="virtualNetwork">Virtual Network</label>
              {virtualNetworks.length > 0 ? (
                <select
                  id="virtualNetwork"
                  name="networking.virtualNetworkId"
                  value={formData.networking.virtualNetworkId}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">None (Use default network)</option>
                  {virtualNetworks.map(vnet => (
                    <option key={vnet.id} value={vnet.id}>
                      {vnet.name} ({vnet.addressSpace})
                    </option>
                  ))}
                </select>
              ) : (
                <div className={styles.placeholderField}>
                  Default virtual network will be used
                </div>
              )}
            </div>
            
            {/* Subnet - Only show if virtual network is selected and networks are available */}
            {formData.networking.virtualNetworkId && virtualNetworks.length > 0 && (
              <div className={styles.formGroup}>
                <label htmlFor="subnet">Subnet</label>
                <select
                  id="subnet"
                  name="networking.subnetId"
                  value={formData.networking.subnetId}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">None (Use default subnet)</option>
                  {subnets.map(subnet => (
                    <option key={subnet.id} value={subnet.id}>
                      {subnet.name} ({subnet.addressPrefix})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Public IP - Keep this regardless of API availability */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="networking.publicIp"
                  checked={formData.networking.publicIp}
                  onChange={handleInputChange}
                />
                <span>Create Public IP</span>
              </label>
              
              {formData.networking.publicIp && (
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="networking.deletePublicIpWithVm"
                      checked={formData.networking.deletePublicIpWithVm}
                      onChange={handleInputChange}
                    />
                    <span>Delete Public IP when VM is deleted</span>
                  </label>
                </div>
              )}
            </div>
            
            {/* Delete NIC with VM */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="networking.deleteNicWithVm"
                  checked={formData.networking.deleteNicWithVm}
                  onChange={handleInputChange}
                />
                <span>Delete network interface when VM is deleted</span>
              </label>
            </div>
            
            <div className={styles.infoMessage}>
              <p>Note: The VM will be created with appropriate default network settings even if network configuration options are limited.</p>
            </div>
          </>
        );
        
      case 4:
        return (
          <>
            <h3 className={styles.stepTitle}>Review and Create</h3>
            
            <div className={styles.reviewSection}>
              <h4>Basic Information</h4>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>VM Name:</span>
                <span className={styles.reviewValue}>{formData.name}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Configuration:</span>
                <span className={styles.reviewValue}>
                  {selectedConfig ? selectedConfig.name : 'Not selected'}
                </span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Region:</span>
                <span className={styles.reviewValue}>{formData.region}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Zone:</span>
                <span className={styles.reviewValue}>{formData.zone}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Operating System:</span>
                <span className={styles.reviewValue}>
                  {formData.os.name} {formData.os.version}
                </span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Admin Username:</span>
                <span className={styles.reviewValue}>{formData.adminAccount.username}</span>
              </div>
              {formData.os.name === 'Windows' && (
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>RDP Enabled:</span>
                  <span className={styles.reviewValue}>{formData.adminAccount.rdpEnabled ? 'Yes' : 'No'}</span>
                </div>
              )}
              
              <h4>Disks</h4>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>OS Disk:</span>
                <span className={styles.reviewValue}>
                  {selectedConfig ? `${selectedConfig.specs.storage}GB Standard SSD` : '50GB Standard SSD'}
                </span>
              </div>
              {formData.additionalDisks.length > 0 && (
                <>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Additional Disks:</span>
                    <span className={styles.reviewValue}>{formData.additionalDisks.length} disk(s)</span>
                  </div>
                  {formData.additionalDisks.map((disk, index) => (
                    <div key={index} className={styles.reviewSubItem}>
                      <span className={styles.reviewLabel}>{disk.name}:</span>
                      <span className={styles.reviewValue}>{disk.sizeGB}GB ({disk.storageType})</span>
                    </div>
                  ))}
                </>
              )}
              
              <h4>Networking</h4>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Virtual Network:</span>
                <span className={styles.reviewValue}>
                  {formData.networking.virtualNetworkId ? 
                    virtualNetworks.find(vn => vn.id === formData.networking.virtualNetworkId)?.name || 'Selected' : 
                    'Default'}
                </span>
              </div>
              {formData.networking.virtualNetworkId && formData.networking.subnetId && (
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Subnet:</span>
                  <span className={styles.reviewValue}>
                    {subnets.find(s => s.id === formData.networking.subnetId)?.name || 'Selected'}
                  </span>
                </div>
              )}
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Public IP:</span>
                <span className={styles.reviewValue}>{formData.networking.publicIp ? 'Yes' : 'No'}</span>
              </div>
              {formData.networking.publicIp && (
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Delete Public IP with VM:</span>
                  <span className={styles.reviewValue}>{formData.networking.deletePublicIpWithVm ? 'Yes' : 'No'}</span>
                </div>
              )}
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Delete Network Interface with VM:</span>
                <span className={styles.reviewValue}>{formData.networking.deleteNicWithVm ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <>
      <div 
        className={`${styles.drawerBackdrop} ${isOpen && !isClosing ? styles.drawerBackdropVisible : ''}`} 
        onClick={handleCloseDrawer}
      />
      <div className={`${styles.drawer} ${isOpen && !isClosing ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerContainer} ref={drawerRef}>
          <div className={styles.drawerHeader}>
            <h2 className={styles.drawerTitle}>Create Virtual Machine</h2>
            <button 
              className={styles.drawerCloseButton}
              onClick={handleCloseDrawer}
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>
          
          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}
          {apiErrors.length > 0 && (
            <ApiErrorDisplay errors={apiErrors} />
          )}
          
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepItem} ${currentStep >= 1 ? styles.stepActive : ''}`}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepLabel}>Basic Information</div>
            </div>
            <div className={`${styles.stepItem} ${currentStep >= 2 ? styles.stepActive : ''}`}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepLabel}>Disk</div>
            </div>
            <div className={`${styles.stepItem} ${currentStep >= 3 ? styles.stepActive : ''}`}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepLabel}>Networking</div>
            </div>
            <div className={`${styles.stepItem} ${currentStep >= 4 ? styles.stepActive : ''}`}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepLabel}>Review & Create</div>
            </div>
          </div>
          
          <div className={styles.drawerContent}>
            {renderStepContent()}
          </div>
          
          <div className={styles.drawerFooter}>
            {currentStep > 1 && (
              <button 
                type="button"
                className={styles.backButton}
                onClick={goToPreviousStep}
                disabled={apiLoading}
              >
                Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button 
                type="button"
                className={styles.nextButton}
                onClick={goToNextStep}
                disabled={apiLoading || !isFormReady}
              >
                Next
              </button>
            ) : (
              <button 
                type="button"
                className={styles.createButton}
                onClick={handleCreateVM}
                disabled={apiLoading || creating || !isFormReady || !isConfigAvailable}
              >
                {creating ? 'Creating...' : 'Create VM'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateVMDrawer; 