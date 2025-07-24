'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscriptionService } from '../services/subscriptionService';

const CloudContext = createContext();

export const CloudProvider = ({ children }) => {
  // State for various resources
  const [virtualMachines, setVirtualMachines] = useState([]);
  const [storages, setStorages] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState({
    cpu: { total: 1, used: 0 },
    memory: { total: 0.5, used: 0 },
    storage: { total: 50, used: 0 },
  });

  // Usage metrics with randomized data for simulation
  const [metrics, setMetrics] = useState({
    cpu: generateRandomUsageData(24),
    memory: generateRandomUsageData(24),
    network: generateRandomUsageData(24),
    storage: generateRandomUsageData(24),
  });

  // Generate random data points for graphs
  function generateRandomUsageData(points) {
    return Array.from({ length: points }, () => ({
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
      value: Math.floor(Math.random() * 100),
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Get the current user from auth context
  const { user } = useAuth();
  
  // Load data from localStorage and update with subscription data
  useEffect(() => {
    if (!user) return;
    
    const userId = user.id || user.email;
    const storedVMs = localStorage.getItem(`mycloud_vms_${userId}`);
    const storedStorages = localStorage.getItem(`mycloud_storages_${userId}`);
    const storedNetworks = localStorage.getItem(`mycloud_networks_${userId}`);
    
    if (storedVMs) setVirtualMachines(JSON.parse(storedVMs));
    if (storedStorages) setStorages(JSON.parse(storedStorages));
    if (storedNetworks) setNetworks(JSON.parse(storedNetworks));

    // Load subscription data to get resource limits
    const loadSubscriptionData = async () => {
      try {
        // Get subscription tiers and user's current subscription
        let subscriptionTiers;
        let userSubscription;
        
        try {
          // Fetch subscription data
          const tiersResponse = await subscriptionService.getAllSubscriptionTiers();
          const userSubResponse = await subscriptionService.getUserSubscription();
          
          // Check if response is an array or contains a subscriptions array
          if (Array.isArray(tiersResponse)) {
            subscriptionTiers = tiersResponse;
          } else if (tiersResponse && tiersResponse.subscriptions && Array.isArray(tiersResponse.subscriptions)) {
            subscriptionTiers = tiersResponse.subscriptions;
          } else {
            // Fallback to mock data if API response format is unexpected
            throw new Error("Unexpected API response format");
          }
          
          // Check user subscription format
          if (userSubResponse && userSubResponse.tier) {
            userSubscription = userSubResponse;
          } else if (userSubResponse && userSubResponse.subscription && userSubResponse.subscription.tier) {
            userSubscription = userSubResponse.subscription;
          } else {
            userSubscription = { tier: 'free' }; // Default
          }
        } catch (error) {
          console.warn("Could not fetch subscription data from API, using mock data", error);
          subscriptionTiers = subscriptionService.getSubscriptionTiers();
          userSubscription = { tier: 'free' }; // Default to free tier
        }
        
        // Log the subscription data for debugging
        console.log("Subscription tiers:", subscriptionTiers);
        console.log("User subscription:", userSubscription);
        
        // Find the user's subscription tier details
        // Make sure subscriptionTiers is an array before calling find
        // Extract the tier ID based on API response format
        const tierIdentifier = userSubscription.tier?.id || userSubscription.tier;
        
        const userTier = Array.isArray(subscriptionTiers) 
          ? (subscriptionTiers.find(tier => tier.id === tierIdentifier) || 
             subscriptionTiers.find(tier => tier.id === 'free'))
          : null;
        
                  if (userTier) {
            // Update resources based on subscription
            const storedResources = localStorage.getItem(`mycloud_resources_${userId}`);
            
            // Extract resource values safely with defaults
            const cpuTotal = userTier.features?.compute?.vCPU || 
                            userTier.resources?.compute?.vCpuCores || 
                            userTier.resources?.cpu?.total || 1;
                            
            const memoryTotal = userTier.features?.compute?.ram || 
                               userTier.resources?.compute?.ramGB || 
                               userTier.resources?.memory?.total || 0.5;
                               
            const storageTotal = userTier.features?.storage?.total || 
                                userTier.resources?.storage?.totalGB || 
                                userTier.resources?.storage?.total || 50;
            
            let resourcesData = {
              cpu: { 
                total: cpuTotal,
                used: 0 
              },
              memory: { 
                total: memoryTotal,
                used: 0 
              },
              storage: { 
                total: storageTotal,
                used: 0 
              }
            };
            
            // Check if API returned quota usage data
            if (userSubscription.quotaUsage) {
              // Use API data for resource usage
              resourcesData = {
                cpu: { 
                  total: userTier.features?.compute?.vCPU || cpuTotal,
                  used: userSubscription.quotaUsage.compute?.vCpuCores?.used || 0
                },
                memory: { 
                  total: userTier.features?.compute?.ram || memoryTotal,
                  used: userSubscription.quotaUsage.compute?.ramGB?.used || 0
                },
                storage: { 
                  total: userTier.features?.storage?.total || storageTotal,
                  used: userSubscription.quotaUsage.storage?.totalGB?.used || 0
                }
              };
            } else if (storedResources) {
              // Fall back to stored resources if API doesn't provide quota data
              const parsedResources = JSON.parse(storedResources);
              resourcesData = {
                cpu: { 
                  total: userTier.features?.compute?.vCPU || cpuTotal,
                  used: Math.min(parsedResources.cpu.used, userTier.features?.compute?.vCPU || cpuTotal)
                },
                memory: { 
                  total: userTier.features?.compute?.ram || memoryTotal,
                  used: Math.min(parsedResources.memory.used, userTier.features?.compute?.ram || memoryTotal)
                },
                storage: { 
                  total: userTier.features?.storage?.total || storageTotal,
                  used: Math.min(parsedResources.storage.used, userTier.features?.storage?.total || storageTotal)
                }
              };
            }
          
          setResources(resourcesData);
        }
      } catch (error) {
        console.error("Error loading subscription data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscriptionData();

    // Update metrics periodically to simulate real-time data
    const interval = setInterval(() => {
      updateMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Update localStorage whenever state changes
  useEffect(() => {
    if (!loading && user) {
      const userId = user.id || user.email;
      localStorage.setItem(`mycloud_vms_${userId}`, JSON.stringify(virtualMachines));
      localStorage.setItem(`mycloud_storages_${userId}`, JSON.stringify(storages));
      localStorage.setItem(`mycloud_networks_${userId}`, JSON.stringify(networks));
      localStorage.setItem(`mycloud_resources_${userId}`, JSON.stringify(resources));
    }
  }, [virtualMachines, storages, networks, resources, loading, user]);

  // Update metrics with new random data points
  const updateMetrics = () => {
    setMetrics(prev => ({
      cpu: [...prev.cpu.slice(1), { timestamp: new Date().toISOString(), value: Math.floor(Math.random() * 100) }],
      memory: [...prev.memory.slice(1), { timestamp: new Date().toISOString(), value: Math.floor(Math.random() * 100) }],
      network: [...prev.network.slice(1), { timestamp: new Date().toISOString(), value: Math.floor(Math.random() * 100) }],
      storage: [...prev.storage.slice(1), { timestamp: new Date().toISOString(), value: Math.floor(Math.random() * 100) }],
    }));
  };

  // Create a new virtual machine
  const createVirtualMachine = (vmData) => {
    const newVM = {
      id: `vm_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'starting',
      ...vmData
    };

    // Update resources
    setResources(prev => ({
      ...prev,
      cpu: { ...prev.cpu, used: prev.cpu.used + vmData.cpu },
      memory: { ...prev.memory, used: prev.memory.used + vmData.memory }
    }));

    // Add the VM
    setVirtualMachines(prev => [...prev, newVM]);

    // Simulate VM starting up
    setTimeout(() => {
      setVirtualMachines(prev => 
        prev.map(vm => vm.id === newVM.id ? { ...vm, status: 'running' } : vm)
      );
    }, 3000);

    return newVM;
  };

  // Update VM status
  const updateVMStatus = (vmId, status) => {
    setVirtualMachines(prev => 
      prev.map(vm => vm.id === vmId ? { ...vm, status } : vm)
    );

    // Simulate status changes
    if (status === 'stopping') {
      setTimeout(() => {
        setVirtualMachines(prev => 
          prev.map(vm => vm.id === vmId ? { ...vm, status: 'stopped' } : vm)
        );
      }, 2000);
    } else if (status === 'starting') {
      setTimeout(() => {
        setVirtualMachines(prev => 
          prev.map(vm => vm.id === vmId ? { ...vm, status: 'running' } : vm)
        );
      }, 2000);
    }
  };

  // Delete VM
  const deleteVM = (vmId) => {
    const vm = virtualMachines.find(vm => vm.id === vmId);
    
    if (vm) {
      // Free up resources
      setResources(prev => ({
        ...prev,
        cpu: { ...prev.cpu, used: prev.cpu.used - vm.cpu },
        memory: { ...prev.memory, used: prev.memory.used - vm.memory }
      }));

      // Remove VM
      setVirtualMachines(prev => prev.filter(vm => vm.id !== vmId));
    }
  };

  // Create storage
  const createStorage = (storageData) => {
    const newStorage = {
      id: `storage_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'available',
      ...storageData
    };

    // Update resources
    setResources(prev => ({
      ...prev,
      storage: { ...prev.storage, used: prev.storage.used + storageData.size }
    }));

    // Add storage
    setStorages(prev => [...prev, newStorage]);
    
    return newStorage;
  };

  // Delete storage
  const deleteStorage = (storageId) => {
    const storage = storages.find(s => s.id === storageId);
    
    if (storage) {
      // Free up resources
      setResources(prev => ({
        ...prev,
        storage: { ...prev.storage, used: prev.storage.used - storage.size }
      }));

      // Remove storage
      setStorages(prev => prev.filter(s => s.id !== storageId));
    }
  };

  // Create network
  const createNetwork = (networkData) => {
    const newNetwork = {
      id: `network_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'available',
      ...networkData
    };

    setNetworks(prev => [...prev, newNetwork]);
    
    return newNetwork;
  };

  // Delete network
  const deleteNetwork = (networkId) => {
    setNetworks(prev => prev.filter(n => n.id !== networkId));
  };

  // Reset everything (for demo purposes)
  const resetCloud = () => {
    setVirtualMachines([]);
    setStorages([]);
    setNetworks([]);
    setResources({
      cpu: { total: 20, used: 0 },
      memory: { total: 64, used: 0 },
      storage: { total: 1024, used: 0 },
    });
    
    if (user) {
      const userId = user.id || user.email;
      localStorage.removeItem(`mycloud_vms_${userId}`);
      localStorage.removeItem(`mycloud_storages_${userId}`);
      localStorage.removeItem(`mycloud_networks_${userId}`);
      localStorage.removeItem(`mycloud_resources_${userId}`);
    }
  };

  const value = {
    virtualMachines,
    storages,
    networks,
    resources,
    metrics,
    loading,
    createVirtualMachine,
    updateVMStatus,
    deleteVM,
    createStorage,
    deleteStorage,
    createNetwork,
    deleteNetwork,
    resetCloud
  };

  return (
    <CloudContext.Provider value={value}>
      {children}
    </CloudContext.Provider>
  );
};

export const useCloud = () => {
  const context = useContext(CloudContext);
  if (context === undefined) {
    throw new Error('useCloud must be used within a CloudProvider');
  }
  return context;
}; 