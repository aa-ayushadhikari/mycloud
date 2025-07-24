import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from './useAuth';

export function useSubscription() {
  const { user } = useAuth();
  const [subscriptionTiers, setSubscriptionTiers] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load subscription data when user is authenticated
  useEffect(() => {
    if (!user) return;
    
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        
        // Fetch subscription tiers
        try {
          const tiersResponse = await subscriptionService.getAllSubscriptionTiers();
          setSubscriptionTiers(tiersResponse);
        } catch (apiError) {
          console.warn("Could not fetch subscription tiers from API, using mock data");
          // Fall back to mock data
          setSubscriptionTiers(subscriptionService.getSubscriptionTiers());
        }
        
        // Fetch user subscription
        try {
          const userSubResponse = await subscriptionService.getUserSubscription();
          setUserSubscription(userSubResponse);
        } catch (apiError) {
          console.warn("Could not fetch user subscription from API, using mock data");
          // Fall back to mock data (free tier)
          setUserSubscription({
            tier: 'free',
            status: 'active',
            startDate: new Date().toISOString(),
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
        
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch subscription data');
        console.error('Subscription data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  const updateSubscription = async (tier) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      const response = await subscriptionService.updateSubscription(tier);
      
      // Update subscription data
      setUserSubscription(response);
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update subscription');
      console.error('Subscription update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get current tier details based on user's subscription
  const getCurrentTierDetails = () => {
    if (!userSubscription || !subscriptionTiers.length) return null;
    
    // Handle the new API format where userSubscription might have tier object or just tier ID
    const tierIdentifier = userSubscription.tier?.id || userSubscription.tier;
    
    return subscriptionTiers.find(tier => tier.id === tierIdentifier) || null;
  };

  // Check if user has sufficient resources based on their subscription tier
  const checkResourceAvailability = (resourceType, amount) => {
    const currentTier = getCurrentTierDetails();
    if (!currentTier) return false;
    
    switch (resourceType) {
      case 'vCPU':
        return amount <= currentTier.features.compute.vCPU;
      case 'memory':
      case 'ram':
        return amount <= currentTier.features.compute.ram;
      case 'instances':
        return amount <= currentTier.features.compute.instances;
      case 'storage':
        return amount <= currentTier.features.storage.total;
      default:
        return false;
    }
  };

  return {
    subscriptionTiers,
    userSubscription,
    loading,
    error,
    updateSubscription,
    getCurrentTierDetails,
    checkResourceAvailability
  };
} 