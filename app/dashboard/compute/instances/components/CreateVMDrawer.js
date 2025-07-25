import { useState, useEffect, useRef } from 'react';
import { useCloud } from '../../../../context/CloudContext';
import styles from '../instances.module.css';
import { useAuth } from '../../../../hooks/useAuth';
import { subscriptionService } from '../../../../services/subscriptionService';

const CreateVMDrawer = ({ isOpen, onClose }) => {
  const { createVirtualMachine, resources, virtualMachines } = useCloud();
  const { user } = useAuth();
  const drawerRef = useRef(null);
  
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
  
  console.log('User object directly from useAuth():', user);
  
  if (user) {
    console.log('User subscription from useAuth:', user.subscription);
    if (user.subscription) {
      console.log('User subscription tier:', user.subscription.tier);
    }
  }
  
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(60); // For free tier
  
  console.log('Current subscription tier state:', subscriptionTier);

  // VM configuration form data
  const [formData, setFormData] = useState({
    name: '',
    type: 'General Purpose',
    image: 'windows-10-pro',
    cpu: 1,
    memory: 0.5,
    username: '',
    password: '',
    confirmPassword: '',
    inboundPorts: ['3389'], // Default to allow RDP port
    osDisks: [{ name: 'OS Disk', size: 128 }],
    additionalDisks: [],
    networkInterface: {
      virtualNetwork: 'AyushAdhikari-vnet',
      subnet: 'default (10.0.0.0/24)',
      publicIp: true,
      publicIpName: `ip-${Math.random().toString(36).substring(2, 8)}`,
      securityGroup: 'Basic',
      deleteWithVM: true,
      acceleratedNetworking: false,
    },
    loadBalancing: 'None'
  });
  
  // VM configurations based on subscription
  const vmConfigurations = {
    free: [
      { cpu: 1, memory: 0.5, label: '1vCPU, 0.5GB RAM', maxInstances: 1, description: 'Limited to 60 minutes' }
    ],
    startup: [
      { cpu: 1, memory: 0.5, label: '1vCPU, 0.5GB RAM', maxInstances: 2, description: 'Ideal for small workloads' },
      { cpu: 2, memory: 1, label: '2vCPU, 1GB RAM', maxInstances: 1, description: 'Good for development environments' }
    ],
    basic: [
      { cpu: 1, memory: 0.5, label: '1vCPU, 0.5GB RAM', maxInstances: 6, description: 'Ideal for small workloads' },
      { cpu: 2, memory: 1, label: '2vCPU, 1GB RAM', maxInstances: 3, description: 'Good for development environments' }
    ],
    gold: [
      { cpu: 1, memory: 0.5, label: '1vCPU, 0.5GB RAM', maxInstances: 8, description: 'Ideal for small workloads' },
      { cpu: 2, memory: 1, label: '2vCPU, 1GB RAM', maxInstances: 4, description: 'Good for development environments' },
      { cpu: 8, memory: 16, label: '8vCPU, 16GB RAM', maxInstances: 1, description: 'High performance computing' }
    ]
  };
  
  // Count existing instances by configuration
  const countInstancesByConfig = (cpu, memory) => {
    return virtualMachines.filter(vm => vm.cpu === cpu && vm.memory === memory).length;
  };
  
  // Reset form when drawer opens and handle animation
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setCurrentStep(1);
      setError('');
      
      // Get default configuration for user's tier
      let defaultConfig = { cpu: 1, memory: 0.5 }; // Default for free tier
      
      // Select an appropriate default configuration based on subscription
      if (subscriptionTier === 'gold') {
        defaultConfig = { cpu: 2, memory: 1 }; // Mid-range option for Gold
      } else if (subscriptionTier === 'basic') {
        defaultConfig = { cpu: 2, memory: 1 }; // Higher option for Basic
      } else if (subscriptionTier === 'startup') {
        defaultConfig = { cpu: 1, memory: 0.5 }; // Lower option for Startup
      }
      
      console.log('Setting default config based on tier:', subscriptionTier, defaultConfig);
      
      setFormData({
        name: '',
        type: 'General Purpose',
        image: 'windows-10-pro',
        cpu: defaultConfig.cpu,
        memory: defaultConfig.memory,
        username: '',
        password: '',
        confirmPassword: '',
        inboundPorts: ['3389'], // Default to allow RDP port
        osDisks: [{ name: 'OS Disk', size: 128 }],
        additionalDisks: [],
        networkInterface: {
          virtualNetwork: 'AyushAdhikari-vnet',
          subnet: 'default (10.0.0.0/24)',
          publicIp: true,
          publicIpName: `ip-${Math.random().toString(36).substring(2, 8)}`,
          securityGroup: 'Basic',
          deleteWithVM: true,
          acceleratedNetworking: false,
        },
        loadBalancing: 'None'
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
  }, [isOpen, subscriptionTier]);
  
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
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., networkInterface.virtualNetwork)
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
  const handleConfigSelection = (config) => {
    setFormData({
      ...formData,
      cpu: config.cpu,
      memory: config.memory
    });
  };
  
  // Handle inbound ports selection
  const handlePortSelection = (port) => {
    if (formData.inboundPorts.includes(port)) {
      setFormData({
        ...formData,
        inboundPorts: formData.inboundPorts.filter(p => p !== port)
      });
    } else {
      setFormData({
        ...formData,
        inboundPorts: [...formData.inboundPorts, port]
      });
    }
  };
  
  // Add additional disk
  const handleAddDisk = () => {
    setFormData({
      ...formData,
      additionalDisks: [
        ...formData.additionalDisks,
        { name: `Disk-${formData.additionalDisks.length + 1}`, size: 128 }
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
      
      if (!formData.username.trim()) {
        setError('Administrator username is required');
        return;
      }
      
      if (!formData.password.trim()) {
        setError('Administrator password is required');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
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
  
  // Handle VM creation
  const handleCreateVM = () => {
    // Final validation
    if (!formData.name.trim()) {
      setError('VM Name is required');
      return;
    }
    
    // Get current resource usage
    const currentCpuUsage = virtualMachines.reduce((total, vm) => total + vm.cpu, 0);
    const currentMemoryUsage = virtualMachines.reduce((total, vm) => total + vm.memory, 0);
    
    // Get tier resource limits
    const tierLimits = {
      free: { maxCpu: 1, maxMemory: 0.5, maxInstances: 1 },
      startup: { maxCpu: 2, maxMemory: 1, maxInstances: 2 },
      basic: { maxCpu: 6, maxMemory: 3, maxInstances: 6 },
      gold: { maxCpu: 8, maxMemory: 16, maxInstances: 8 }
    };
    
    const limits = tierLimits[subscriptionTier] || tierLimits.free;
    
    // Special handling for startup tier
    if (subscriptionTier === 'startup') {
      // If trying to create a 2vCPU VM, ensure no other VMs exist
      if (formData.cpu === 2 && formData.memory === 1 && virtualMachines.length > 0) {
        setError('Startup tier can only have 1 instance of 2vCPU/1GB RAM with no other instances');
        return;
      }
      
      // If trying to create a 1vCPU VM but a 2vCPU VM already exists
      if (formData.cpu === 1 && formData.memory === 0.5 && virtualMachines.some(vm => vm.cpu === 2)) {
        setError('Startup tier cannot mix 2vCPU and 1vCPU instances');
        return;
      }
      
      // If already have 2 instances of 1vCPU
      if (formData.cpu === 1 && formData.memory === 0.5 && 
          virtualMachines.filter(vm => vm.cpu === 1 && vm.memory === 0.5).length >= 2) {
        setError('Startup tier is limited to maximum 2 instances of 1vCPU/0.5GB RAM');
        return;
      }
    }
    
    // Basic tier special handling
    if (subscriptionTier === 'basic') {
      // If trying to create a combination that exceeds the total resources
      const newTotalCpu = currentCpuUsage + formData.cpu;
      const newTotalMemory = currentMemoryUsage + formData.memory;
      
      if (newTotalCpu > limits.maxCpu) {
        setError(`Basic tier is limited to ${limits.maxCpu} total vCPUs (${limits.maxCpu - currentCpuUsage} remaining)`);
        return;
      }
      
      if (newTotalMemory > limits.maxMemory) {
        setError(`Basic tier is limited to ${limits.maxMemory}GB total RAM (${limits.maxMemory - currentMemoryUsage}GB remaining)`);
        return;
      }
    }
    
    // Gold tier special handling
    if (subscriptionTier === 'gold') {
      // If trying to create a combination that exceeds the total resources
      const newTotalCpu = currentCpuUsage + formData.cpu;
      const newTotalMemory = currentMemoryUsage + formData.memory;
      
      if (newTotalCpu > limits.maxCpu) {
        setError(`Gold tier is limited to ${limits.maxCpu} total vCPUs (${limits.maxCpu - currentCpuUsage} remaining)`);
        return;
      }
      
      if (newTotalMemory > limits.maxMemory) {
        setError(`Gold tier is limited to ${limits.maxMemory}GB total RAM (${limits.maxMemory - currentMemoryUsage}GB remaining)`);
        return;
      }
      
      // If trying to create more than one 8vCPU instance
      if (formData.cpu === 8 && formData.memory === 16 && 
          virtualMachines.some(vm => vm.cpu === 8 && vm.memory === 16)) {
        setError('Gold tier can only have 1 instance of 8vCPU/16GB RAM');
        return;
      }
    }
    
    // Check if max instance count reached
    if (virtualMachines.length >= limits.maxInstances) {
      setError(`You have reached the maximum number of instances (${limits.maxInstances}) allowed for your ${subscriptionTier} subscription`);
      return;
    }
    
    // All validation passed, create the VM
    createVirtualMachine({
      name: formData.name,
      type: 'general',
      cpu: formData.cpu,
      memory: formData.memory,
      disk: formData.osDisks[0].size,
      os: formData.image,
      username: formData.username,
      password: formData.password,
      inboundPorts: formData.inboundPorts,
      additionalDisks: formData.additionalDisks,
      networkInterface: formData.networkInterface
    });
    
    // Close drawer
    handleCloseDrawer();
  };
  
  // VM image options
  const imageOptions = [
    { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS', icon: '🐧' },
    { id: 'windows-10-pro', name: 'Windows 10 Pro', icon: '🪟', recommended: true },
    { id: 'windows-11-pro', name: 'Windows 11 Pro', icon: '🪟' },
    { id: 'linux-generic', name: 'Linux', icon: '🐧' }
  ];
  
  // Available configurations based on subscription
  console.log('About to select configurations for tier:', subscriptionTier);
  
  const availableConfigurations = vmConfigurations[subscriptionTier] || vmConfigurations.free;
  console.log('Final tier used for configurations:', subscriptionTier);
  console.log('Available configurations selected:', availableConfigurations);
  
  // Render specific step content based on currentStep
  const renderStepContent = () => {
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
                placeholder="Enter VM name"
              />
            </div>
            
            {/* VM Type */}
            <div className={styles.formGroup}>
              <label htmlFor="vmType">VM Type</label>
              <input
                type="text"
                id="vmType"
                name="type"
                value={formData.type}
                className={styles.input}
                disabled
              />
              <p className={styles.helperText}>Not changeable</p>
            </div>
            
            {/* VM Image */}
            <div className={styles.formGroup}>
              <label>Image</label>
              <div className={styles.imageOptions}>
                {imageOptions.map(image => (
                  <div 
                    key={image.id} 
                    className={`${styles.imageOption} ${formData.image === image.id ? styles.selectedImage : ''}`}
                    onClick={() => setFormData({...formData, image: image.id})}
                  >
                    <span className={styles.imageIcon}>{image.icon}</span>
                    <div className={styles.imageText}>
                      <span>{image.name}</span>
                      {image.recommended && subscriptionTier === 'free' && (
                        <span className={styles.recommendedTag}>Recommended for free users</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* VM Configuration */}
            <div className={styles.formGroup}>
              <label>VM Configuration</label>
              <p className={styles.configDescription}>
                Select a configuration based on your subscription tier
              </p>
              
              {/* Show current resource usage */}
              <div className={styles.resourceUsage}>
                <p className={styles.resourceUsageTitle}>Current Usage:</p>
                <div className={styles.resourceUsageItem}>
                  <span>CPU:</span>
                  <span>{virtualMachines.reduce((total, vm) => total + vm.cpu, 0)} / {resources.cpu.total} vCPUs</span>
                </div>
                <div className={styles.resourceUsageItem}>
                  <span>Memory:</span>
                  <span>{virtualMachines.reduce((total, vm) => total + vm.memory, 0)} / {resources.memory.total} GB RAM</span>
                </div>
                <div className={styles.resourceUsageItem}>
                  <span>Instances:</span>
                  <span>{virtualMachines.length} / {
                    subscriptionTier === 'free' ? 1 :
                    subscriptionTier === 'startup' ? 2 :
                    subscriptionTier === 'basic' ? 6 :
                    subscriptionTier === 'gold' ? 8 : 1
                  }</span>
                </div>
              </div>
              
              <div className={styles.configOptionsWrapper}>
                <div className={styles.configOptions}>
                  {availableConfigurations.map((config, index) => {
                    const usedCount = countInstancesByConfig(config.cpu, config.memory);
                    const isDisabled = usedCount >= config.maxInstances;
                    const remainingInstances = config.maxInstances - usedCount;
                    
                    return (
                      <div 
                        key={index} 
                        className={`
                          ${styles.configOption} 
                          ${formData.cpu === config.cpu && formData.memory === config.memory ? styles.selectedConfig : ''}
                          ${isDisabled ? styles.disabledConfig : ''}
                        `}
                        onClick={() => !isDisabled && handleConfigSelection(config)}
                      >
                        <div className={styles.configHeader}>
                          <span className={styles.configName}>{config.label}</span>
                          {subscriptionTier === 'free' && config.cpu === 1 && config.memory === 0.5 && (
                            <span className={styles.minutesTag}>Minutes Left: {remainingMinutes}</span>
                          )}
                        </div>
                        <div className={styles.configDetails}>
                          <div className={styles.configDescription}>{config.description}</div>
                          <div className={styles.instancesAvailable}>
                            {isDisabled ? (
                              <span className={styles.noInstancesLeft}>No instances left</span>
                            ) : (
                              <span className={styles.instancesLeft}>
                                {remainingInstances} instance{remainingInstances !== 1 ? 's' : ''} available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Show only the tier info relevant to the user's subscription */}
              {subscriptionTier === 'free' && (
                <p className={styles.tierLimitInfo}>
                  Free tier: Limited to 1 instance of 1vCPU, 0.5GB RAM with 60 minute runtime limit
                </p>
              )}
              
              {subscriptionTier === 'startup' && (
                <p className={styles.tierLimitInfo}>
                  Startup tier: Can create up to 2 instances of 1vCPU, 0.5GB RAM or 1 instance of 2vCPU, 1GB RAM
                </p>
              )}
              
              {subscriptionTier === 'basic' && (
                <p className={styles.tierLimitInfo}>
                  Basic tier: Can create up to 3 instances of 2vCPU, 1GB RAM or 6 instances of 1vCPU, 0.5GB RAM
                </p>
              )}
              
              {subscriptionTier === 'gold' && (
                <p className={styles.tierLimitInfo}>
                  Gold tier: Can create 1 instance of 8vCPU, 16GB RAM or 4 instances of 2vCPU, 1GB RAM or 8 instances of 1vCPU, 0.5GB RAM
                </p>
              )}
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
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
            
            {/* Inbound Port Rules */}
            <div className={styles.formGroup}>
              <label>Inbound Port Rules</label>
              <p className={styles.helperText}>
                Select which virtual machine network ports are accessible from the public internet. 
                You can specify more limited or granular network access on the Networking tab.
              </p>
              
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="inboundPortsOption"
                    checked={formData.inboundPorts.length === 0}
                    onChange={() => setFormData({...formData, inboundPorts: []})}
                  />
                  <span>None</span>
                </label>
                
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="inboundPortsOption"
                    checked={formData.inboundPorts.length > 0}
                    onChange={() => setFormData({...formData, inboundPorts: ['3389']})}
                  />
                  <span>Allow selected ports</span>
                </label>
              </div>
              
              {formData.inboundPorts.length > 0 && (
                <div className={styles.portsSelection}>
                  <div className={styles.portOption}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.inboundPorts.includes('3389')}
                        onChange={() => handlePortSelection('3389')}
                      />
                      <span>RDP (3389)</span>
                    </label>
                    <p className={styles.portRecommended}>Recommended for connecting with RDP</p>
                  </div>
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
                <span>128GB Fast SSD</span>
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
                          <input
                            type="text"
                            value={disk.name}
                            onChange={(e) => handleEditDisk(index, 'name', e.target.value)}
                            className={styles.diskNameInput}
                          />
                        </div>
                        <div className={styles.diskSize}>
                          <input
                            type="number"
                            value={disk.size}
                            onChange={(e) => handleEditDisk(index, 'size', parseInt(e.target.value))}
                            className={styles.diskSizeInput}
                            min="1"
                            max="1024"
                          />
                          <span>GB</span>
                        </div>
                      </div>
                      <div className={styles.diskActions}>
                        <button 
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => handleDeleteDisk(index)}
                        >
                          Delete
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
            
            <div className={styles.formGroup}>
              <label>Network Interface</label>
              <p className={styles.helperText}>
                When creating a virtual machine, a network interface will be created for you.
              </p>
            </div>
            
            {/* Virtual Network */}
            <div className={styles.formGroup}>
              <label htmlFor="virtualNetwork">Virtual Network</label>
              <div className={styles.networkSelectGroup}>
                <select
                  id="virtualNetwork"
                  name="networkInterface.virtualNetwork"
                  value={formData.networkInterface.virtualNetwork}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="AyushAdhikari-vnet">AyushAdhikari-vnet</option>
                </select>
                <button type="button" className={styles.createNewButton}>
                  Create New
                </button>
              </div>
            </div>
            
            {/* Subnet */}
            <div className={styles.formGroup}>
              <label htmlFor="subnet">Subnet</label>
              <div className={styles.networkSelectGroup}>
                <select
                  id="subnet"
                  name="networkInterface.subnet"
                  value={formData.networkInterface.subnet}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="default (10.0.0.0/24)">default (10.0.0.0/24)</option>
                </select>
                <button type="button" className={styles.manageButton}>
                  Manage Subnet Configuration
                </button>
              </div>
            </div>
            
            {/* Public IP */}
            <div className={styles.formGroup}>
              <label htmlFor="publicIp">Public IP</label>
              <select
                id="publicIp"
                name="networkInterface.publicIpName"
                value={formData.networkInterface.publicIpName}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value={`ip-${Math.random().toString(36).substring(2, 8)}`}>
                  (new) {formData.networkInterface.publicIpName}
                </option>
              </select>
              <button type="button" className={styles.createNewButton}>
                Create New
              </button>
            </div>
            
            {/* Security Group */}
            <div className={styles.formGroup}>
              <label>NIC Network Security Group</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="networkInterface.securityGroup" 
                    value="None"
                    checked={formData.networkInterface.securityGroup === "None"}
                    onChange={handleInputChange}
                  />
                  <span>None</span>
                </label>
                
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="networkInterface.securityGroup" 
                    value="Basic"
                    checked={formData.networkInterface.securityGroup === "Basic"}
                    onChange={handleInputChange}
                  />
                  <span>Basic</span>
                </label>
                
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="networkInterface.securityGroup" 
                    value="Advanced"
                    checked={formData.networkInterface.securityGroup === "Advanced"}
                    onChange={handleInputChange}
                  />
                  <span>Advanced</span>
                </label>
              </div>
            </div>
            
            {/* Public Inbound Ports */}
            <div className={styles.formGroup}>
              <label>Public Inbound Ports</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="inboundPortsOption"
                    checked={formData.inboundPorts.length === 0}
                    onChange={() => setFormData({...formData, inboundPorts: []})}
                  />
                  <span>None</span>
                </label>
                
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="inboundPortsOption"
                    checked={formData.inboundPorts.length > 0}
                    onChange={() => setFormData({...formData, inboundPorts: ['3389']})}
                  />
                  <span>Allow selected ports</span>
                </label>
              </div>
              
              {formData.inboundPorts.length > 0 && (
                <div className={styles.portsSelection}>
                  <div className={styles.portOption}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.inboundPorts.includes('3389')}
                        onChange={() => handlePortSelection('3389')}
                      />
                      <span>RDP (3389)</span>
                    </label>
                  </div>
                  
                  <p className={styles.securityWarning}>
                    This will allow all IP addresses to access your virtual machine. 
                    This is only recommended for testing. Use the Advanced controls to 
                    create rules to limit inbound traffic to known IP addresses.
                  </p>
                </div>
              )}
            </div>
            
            {/* Additional Network Options */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox"
                  name="networkInterface.deleteWithVM"
                  checked={formData.networkInterface.deleteWithVM}
                  onChange={handleInputChange}
                />
                <span>Delete public IP and NIC when VM is deleted</span>
              </label>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox"
                  name="networkInterface.acceleratedNetworking"
                  checked={formData.networkInterface.acceleratedNetworking}
                  onChange={handleInputChange}
                />
                <span>Enable accelerated networking</span>
              </label>
            </div>
            
            {/* Load Balancing */}
            <div className={styles.formGroup}>
              <label>Load Balancing</label>
              <p className={styles.helperText}>
                You can place this virtual machine in the backend pool of an existing Azure load balancing solution.
              </p>
              
              <div className={styles.loadBalancingOptions}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="loadBalancing" 
                    value="None"
                    checked={formData.loadBalancing === "None"}
                    onChange={handleInputChange}
                  />
                  <span>None</span>
                </label>
                
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="loadBalancing" 
                    value="Azure load balancer"
                    checked={formData.loadBalancing === "Azure load balancer"}
                    onChange={handleInputChange}
                  />
                  <div className={styles.optionWithDescription}>
                    <span className={styles.optionTitle}>Azure load balancer</span>
                    <span className={styles.optionDescription}>
                      Supports all TCP/UDP network traffic, port-forwarding, and outbound flows.
                    </span>
                  </div>
                </label>
                
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="loadBalancing" 
                    value="Application gateway"
                    checked={formData.loadBalancing === "Application gateway"}
                    onChange={handleInputChange}
                  />
                  <div className={styles.optionWithDescription}>
                    <span className={styles.optionTitle}>Application gateway</span>
                    <span className={styles.optionDescription}>
                      Web traffic load balancer for HTTP/HTTPS with URL-based routing, SSL termination, 
                      session persistence, and web application firewall.
                    </span>
                  </div>
                </label>
              </div>
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
                <span className={styles.reviewLabel}>VM Type:</span>
                <span className={styles.reviewValue}>{formData.type}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Image:</span>
                <span className={styles.reviewValue}>
                  {imageOptions.find(img => img.id === formData.image)?.name || formData.image}
                </span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>VM Configuration:</span>
                <span className={styles.reviewValue}>{formData.cpu}vCPU, {formData.memory}GB RAM</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Username:</span>
                <span className={styles.reviewValue}>{formData.username}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Inbound Ports:</span>
                <span className={styles.reviewValue}>
                  {formData.inboundPorts.length > 0 ? formData.inboundPorts.join(', ') : 'None'}
                </span>
              </div>
              
              <h4>Disks</h4>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>OS Disk:</span>
                <span className={styles.reviewValue}>128GB Fast SSD</span>
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
                      <span className={styles.reviewValue}>{disk.size}GB</span>
                    </div>
                  ))}
                </>
              )}
              
              <h4>Networking</h4>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Virtual Network:</span>
                <span className={styles.reviewValue}>{formData.networkInterface.virtualNetwork}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Subnet:</span>
                <span className={styles.reviewValue}>{formData.networkInterface.subnet}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Public IP:</span>
                <span className={styles.reviewValue}>
                  {formData.networkInterface.publicIp ? formData.networkInterface.publicIpName : 'None'}
                </span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Security Group:</span>
                <span className={styles.reviewValue}>{formData.networkInterface.securityGroup}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Load Balancing:</span>
                <span className={styles.reviewValue}>{formData.loadBalancing}</span>
              </div>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  // If drawer is not open and not closing, don't render anything
  if (!isOpen && !isClosing) return null;
  
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
              >
                Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button 
                type="button"
                className={styles.nextButton}
                onClick={goToNextStep}
              >
                Next
              </button>
            ) : (
              <button 
                type="button"
                className={styles.createButton}
                onClick={handleCreateVM}
              >
                Create
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateVMDrawer; 