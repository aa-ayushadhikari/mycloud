import apiClient from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const subscriptionService = {
  async getAllSubscriptionTiers() {
    try {
      // This is a public endpoint, no auth required
      const response = await fetch(`${API_URL}/subscriptions/tiers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch subscription tiers with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw subscription tiers data:", data);
      
      // Extract the array of subscriptions
      let subscriptions;
      if (Array.isArray(data)) {
        subscriptions = data;
      } else if (data.subscriptions && Array.isArray(data.subscriptions)) {
        subscriptions = data.subscriptions;
      } else {
        console.warn("Unexpected subscription tiers format:", data);
        subscriptions = [];
      }
      
      console.log("Extracted subscription tiers:", subscriptions);
      return subscriptions;
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
      throw error;
    }
  },

  async getUserSubscription() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userToken = user?.token;
      
      if (!userToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/subscriptions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch user subscription with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw user subscription data:", data);
      
      // Extract the subscription object
      let subscription;
      if (data && data.subscription) {
        subscription = data.subscription;
      } else if (data && data.tier) {
        subscription = data;
      } else {
        console.warn("Unexpected user subscription format:", data);
        subscription = { tier: 'free' };
      }
      
      console.log("Extracted user subscription:", subscription);
      return subscription;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  },

  async updateSubscription(tierName) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userToken = user?.token;
      
      if (!userToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/subscriptions/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier: tierName // 'free', 'startup', 'basic', or 'gold'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update subscription with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.subscription || data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },
  
  // Mock data for development purposes (when API is not available)
  getSubscriptionTiers() {
    return [
      {
        id: 'free',
        name: 'Free Tier',
        price: 0,
        features: {
          compute: {
            vCPU: 1,
            ram: 0.5,
            instances: 1,
            timeLimit: 60 // minutes
          },
          storage: {
            total: 50 // GB
          },
          network: {
            dataTransfer: 10, // GB
            publicIPs: 1
          }
        }
      },
      {
        id: 'startup',
        name: 'Startup Tier',
        price: 10,
        features: {
          compute: {
            vCPU: 2,
            ram: 1,
            instances: 2,
            timeLimit: null // no limit
          },
          storage: {
            total: 500 // GB
          },
          network: {
            dataTransfer: 100, // GB
            publicIPs: 2
          }
        }
      },
      {
        id: 'basic',
        name: 'Basic Tier',
        price: 30,
        features: {
          compute: {
            vCPU: 6,
            ram: 3,
            instances: 3,
            timeLimit: null // no limit
          },
          storage: {
            total: 2000 // GB
          },
          network: {
            dataTransfer: 500, // GB
            publicIPs: 3
          }
        }
      },
      {
        id: 'gold',
        name: 'Gold Tier',
        price: 150,
        features: {
          compute: {
            vCPU: 8,
            ram: 16,
            instances: 8,
            timeLimit: null // no limit
          },
          storage: {
            total: 10000, // GB
          },
          network: {
            dataTransfer: 1000, // GB
            publicIPs: 8
          }
        }
      }
    ];
  }
}; 