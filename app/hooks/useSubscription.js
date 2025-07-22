import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';

export function useSubscription() {
  const [subscriptionTiers, setSubscriptionTiers] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        // Fetch subscription tiers
        const tiersResponse = await subscriptionService.getAllSubscriptionTiers();
        setSubscriptionTiers(tiersResponse.subscriptions);
        
        // Fetch user subscription
        const userSubResponse = await subscriptionService.getUserSubscription();
        setUserSubscription(userSubResponse.subscription);
        
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch subscription data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const updateSubscription = async (tier) => {
    try {
      setLoading(true);
      const response = await subscriptionService.updateSubscription(tier);
      
      // Refresh user subscription data
      const userSubResponse = await subscriptionService.getUserSubscription();
      setUserSubscription(userSubResponse.subscription);
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    subscriptionTiers,
    userSubscription,
    loading,
    error,
    updateSubscription
  };
} 