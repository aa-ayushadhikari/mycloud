import apiClient from './apiClient';

// VM Service functions to fetch VM details
// Note: apiClient.baseURL is set to NEXT_PUBLIC_API_URL which already includes the full base URL (http://140.245.21.155:5001/api)
// So we just need to append the specific endpoints without repeating the /api prefix
const getVmDetails = async (vmId) => {
  try {
    const response = await apiClient.get(`/vms/${vmId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching VM details:', error);
    throw error.response?.data || error;
  }
};

const getVmNetworking = async (vmId) => {
  try {
    const response = await apiClient.get(`/vms/${vmId}/networking`);
    return response.data;
  } catch (error) {
    console.error('Error fetching VM networking details:', error);
    throw error.response?.data || error;
  }
};

const getVmStorage = async (vmId) => {
  try {
    const response = await apiClient.get(`/vms/${vmId}/storage`);
    return response.data;
  } catch (error) {
    console.error('Error fetching VM storage details:', error);
    throw error.response?.data || error;
  }
};

const getVmMonitoring = async (vmId, period = '1h') => {
  try {
    const response = await apiClient.get(`/vms/${vmId}/monitoring?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching VM monitoring data:', error);
    throw error.response?.data || error;
  }
};

// VM Configuration and creation methods
const getVmConfigurations = async () => {
  try {
    const response = await apiClient.get('/vm-configurations');
    console.log('VM Configurations API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching VM configurations:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error.response?.data || error;
  }
};

const getVirtualNetworks = async () => {
  try {
    const response = await apiClient.get('/networking/virtual-networks');
    return response.data;
  } catch (error) {
    console.error('Error fetching virtual networks:', error);
    throw error.response?.data || error;
  }
};

const getSubnets = async (virtualNetworkId) => {
  try {
    const response = await apiClient.get(`/networking/virtual-networks/${virtualNetworkId}/subnets`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subnets:', error);
    throw error.response?.data || error;
  }
};

const getPublicIps = async () => {
  try {
    const response = await apiClient.get('/networking/public-ips');
    return response.data;
  } catch (error) {
    console.error('Error fetching public IPs:', error);
    throw error.response?.data || error;
  }
};

const createVirtualMachine = async (vmData) => {
  try {
    console.log('VM creation request to API:', JSON.stringify(vmData, null, 2));
    // Using the exact endpoint from the documentation
    const response = await apiClient.post('/compute/instances', vmData);
    return response.data;
  } catch (error) {
    console.error('Error creating VM:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      // Log detailed error information
      if (error.response.data && error.response.data.errors) {
        console.error('Detailed validation errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
    }
    // Don't transform the error, just rethrow it to keep all the original details
    throw error;
  }
};

// Update the getAllInstances function to properly handle API responses
export const instanceService = {
  async getAllInstances(page = 1, limit = 10, filters = {}) {
    try {
      const params = {
        page,
        limit,
        ...filters
      };
      
      // Try first with the instances endpoint for backward compatibility
      try {
        const response = await apiClient.get('/instances', { params });
        return response.data;
      } catch (firstError) {
        console.log('First endpoint failed, trying compute/instances endpoint');
        // If the first endpoint fails, try the compute/instances endpoint
        const response = await apiClient.get('/compute/instances', { params });
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching instances:', error);
      // Return an empty array as a fallback for UI rendering
      return { instances: [], currentPage: 1, totalPages: 1, totalInstances: 0 };
    }
  },

  async getInstance(id) {
    try {
      const response = await apiClient.get(`/instances/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createInstance(instanceData) {
    try {
      const response = await apiClient.post('/instances', instanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateInstance(id, updateData) {
    try {
      const response = await apiClient.patch(`/instances/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async startInstance(id) {
    try {
      const response = await apiClient.post(`/compute/instances/${id}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async stopInstance(id) {
    try {
      const response = await apiClient.post(`/compute/instances/${id}/stop`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async terminateInstance(id) {
    try {
      const response = await apiClient.post(`/compute/instances/${id}/terminate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getInstanceTypes() {
    try {
      const response = await apiClient.get('/instances/types/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getOperatingSystems() {
    try {
      const response = await apiClient.get('/instances/os/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // VM Details API
  getVmDetails,
  getVmNetworking,
  getVmStorage,
  getVmMonitoring,
  
  // VM Configuration and Creation API
  getVmConfigurations,
  getVirtualNetworks,
  getSubnets,
  getPublicIps,
  createVirtualMachine
}; 