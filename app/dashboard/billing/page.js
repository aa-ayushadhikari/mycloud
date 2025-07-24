'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import styles from './billing.module.css';

export default function BillingPage() {
  const { user } = useAuth();
  const { 
    subscriptionTiers, 
    userSubscription, 
    loading, 
    error, 
    updateSubscription,
    getCurrentTierDetails 
  } = useSubscription();
  
  const [selectedTier, setSelectedTier] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Set selected tier to current subscription when data loads
  useEffect(() => {
    if (userSubscription) {
      // Handle both tier as string and tier as object formats
      const tierId = userSubscription.tier?.id || userSubscription.tier;
      setSelectedTier(tierId);
    }
  }, [userSubscription]);

  const handleChangePlan = async (tierId) => {
    // Handle both tier as string and tier as object formats
    const currentTierId = userSubscription?.tier?.id || userSubscription?.tier;
    if (tierId === currentTierId) return;
    
    try {
      setProcessing(true);
      setMessage(null);
      
      await updateSubscription(tierId);
      
      setMessage({
        type: 'success',
        text: `Successfully changed to ${subscriptionTiers.find(tier => tier.id === tierId)?.name || tierId} plan`
      });
      
      setSelectedTier(tierId);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to change subscription plan'
      });
      console.error('Failed to update subscription:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getCurrentTier = () => {
    if (!userSubscription || !subscriptionTiers.length) return null;
    
    // Handle both tier as string and tier as object formats
    const tierId = userSubscription.tier?.id || userSubscription.tier;
    return subscriptionTiers.find(tier => tier.id === tierId);
  };
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading subscription data...</p>
      </div>
    );
  }
  
  // Helper functions to safely extract values from possibly nested objects
  const getCpuValue = (tier) => 
    tier?.features?.compute?.vCPU || 
    tier?.resources?.compute?.vCpuCores || 
    tier?.resources?.cpu?.total || 1;
    
  const getRamValue = (tier) => 
    tier?.features?.compute?.ram || 
    tier?.resources?.compute?.ramGB || 
    tier?.resources?.memory?.total || 0.5;
    
  const getInstancesValue = (tier) =>
    tier?.features?.compute?.instances || 
    tier?.resources?.compute?.instances || 1;
    
  const getStorageValue = (tier) =>
    tier?.features?.storage?.total || 
    tier?.resources?.storage?.totalGB || 
    tier?.resources?.storage?.total || 50;
    
  const getDataTransferValue = (tier) =>
    tier?.features?.network?.dataTransfer || 
    tier?.resources?.network?.dataTransferGB || 
    tier?.resources?.network?.bandwidth || 10;
  
  // Transform the subscription tiers data to ensure it has the expected structure
  const transformedTiers = subscriptionTiers.map(tier => {
    // Check if the tier already has the correct format
    if (tier.features && tier.features.compute && tier.features.storage && tier.features.network) {
      return tier;
    }
    
    // Define default values
    const defaultTier = {
      id: tier.id || tier.name?.toLowerCase()?.replace(/\s+/g, '-') || 'unknown',
      name: tier.name || 'Unknown Tier',
      price: tier.price || tier.cost || 0,
      features: {
        compute: {
          vCPU: 1,
          ram: 0.5,
          instances: 1,
          timeLimit: tier.id === 'free' ? 60 : null
        },
        storage: {
          total: 50
        },
        network: {
          dataTransfer: 10,
          publicIPs: 1
        }
      }
    };
    
    // If the tier has any resources data, use it to build features
    if (tier.resources) {
      // Handle different formats
      if (tier.resources.compute) {
        defaultTier.features.compute.vCPU = tier.resources.compute.vCpuCores || tier.resources.compute.vCPU || 1;
        defaultTier.features.compute.ram = tier.resources.compute.ramGB || tier.resources.compute.ram || 0.5;
        defaultTier.features.compute.instances = tier.resources.compute.instances || 1;
      }
      
      if (tier.resources.storage) {
        defaultTier.features.storage.total = tier.resources.storage.totalGB || tier.resources.storage.total || 50;
      }
      
      if (tier.resources.network) {
        defaultTier.features.network.dataTransfer = tier.resources.network.dataTransferGB || tier.resources.network.dataTransfer || 10;
        defaultTier.features.network.publicIPs = tier.resources.network.publicIPs || 1;
      }
    }
    
    console.log("Transformed tier:", defaultTier);
    return defaultTier;
  });
  
  const currentTier = getCurrentTierDetails() || getCurrentTier();

  return (
    <div className={styles.contentContainer}>
      <div className={styles.pageHeader}>
        <h1>Billing & Subscription</h1>
        <p>Manage your subscription and billing details</p>
      </div>
      
      {message && (
        <div className={`${styles.alertBox} ${message.type === 'error' ? styles.alertDanger : styles.alertSuccess}`}>
          {message.text}
        </div>
      )}
      
      <div className={styles.section}>
        <h2>Current Plan</h2>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <h3>{currentTier?.name || 'Free Tier'}</h3>
            <p className={styles.pricingText}>
              {typeof currentTier?.price === 'number' ? 
                (currentTier.price === 0 ? 'Free' : `$${currentTier.price}/month`) : 
                'Free'}
            </p>
            <p>
              Status: <span className={styles.statusBadge}>{
                userSubscription?.status || 
                userSubscription?.subscriptionStatus || 
                'active'
              }</span>
            </p>
            
            <h4>Plan Limits:</h4>
            <ul className={styles.resourceList}>
              <li>
                <span>vCPU Cores:</span>
                <span>{currentTier?.features?.compute?.vCPU || 
                       currentTier?.resources?.compute?.vCpuCores || 
                       currentTier?.resources?.cpu?.total || 1}</span>
              </li>
              <li>
                <span>RAM:</span>
                <span>{currentTier?.features?.compute?.ram || 
                       currentTier?.resources?.compute?.ramGB || 
                       currentTier?.resources?.memory?.total || 0.5} GB</span>
              </li>
              <li>
                <span>Max Instances:</span>
                <span>{currentTier?.features?.compute?.instances || 
                       currentTier?.resources?.compute?.instances || 1}</span>
              </li>
              <li>
                <span>Storage:</span>
                <span>{currentTier?.features?.storage?.total || 
                       currentTier?.resources?.storage?.totalGB || 
                       currentTier?.resources?.storage?.total || 50} GB</span>
              </li>
              <li>
                <span>Data Transfer:</span>
                <span>{currentTier?.features?.network?.dataTransfer || 
                       currentTier?.resources?.network?.dataTransferGB || 
                       currentTier?.resources?.network?.bandwidth || 10} GB</span>
              </li>
            </ul>
          </div>
        </div>
        
        {userSubscription?.quotaUsage && (
          <div className={styles.section}>
            <h3>Current Usage</h3>
            <div className={styles.gridContainer}>
              <div className={styles.card}>
                <div className={styles.cardContent}>
                  <h4>CPU</h4>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ 
                        width: `${Math.min(
                          (userSubscription.quotaUsage.compute?.vCpuCores?.used / 
                           userSubscription.quotaUsage.compute?.vCpuCores?.total) * 100, 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                  <p>{userSubscription.quotaUsage.compute?.vCpuCores?.used || 0} / {userSubscription.quotaUsage.compute?.vCpuCores?.total || getCpuValue(currentTier)} vCPUs</p>
                </div>
              </div>
              
              <div className={styles.card}>
                <div className={styles.cardContent}>
                  <h4>Memory</h4>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ 
                        width: `${Math.min(
                          (userSubscription.quotaUsage.compute?.ramGB?.used / 
                           userSubscription.quotaUsage.compute?.ramGB?.total) * 100, 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                  <p>{userSubscription.quotaUsage.compute?.ramGB?.used || 0} / {userSubscription.quotaUsage.compute?.ramGB?.total || getRamValue(currentTier)} GB</p>
                </div>
              </div>
              
              <div className={styles.card}>
                <div className={styles.cardContent}>
                  <h4>Storage</h4>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ 
                        width: `${Math.min(
                          (userSubscription.quotaUsage.storage?.totalGB?.used / 
                           userSubscription.quotaUsage.storage?.totalGB?.total) * 100, 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                  <p>{userSubscription.quotaUsage.storage?.totalGB?.used || 0} / {userSubscription.quotaUsage.storage?.totalGB?.total || getStorageValue(currentTier)} GB</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.section}>
        <h2>Available Plans</h2>
        <div className={styles.gridContainer}>
          {transformedTiers.map((tier) => (
            <div 
              key={tier.id}
              className={`${styles.card} ${tier.id === selectedTier ? styles.selectedCard : ''}`}
            >
              <div className={styles.cardContent}>
                <h3>{tier.name}</h3>
                <p className={styles.pricingText}>
                  {typeof tier.price === 'number' ? 
                    (tier.price === 0 ? 'Free' : `$${tier.price}/month`) : 
                    'Contact sales'}
                </p>
                
                <ul className={styles.featureList}>
                  <li>
                    <strong>{getCpuValue(tier)}</strong> vCPU cores
                  </li>
                  <li>
                    <strong>{getRamValue(tier)}</strong> GB RAM
                  </li>
                  <li>
                    <strong>{getInstancesValue(tier)}</strong> max instances
                  </li>
                  {tier.features?.compute?.timeLimit && (
                    <li>
                      <strong>{tier.features.compute.timeLimit}</strong> minutes time limit
                    </li>
                  )}
                  <li>
                    <strong>{getStorageValue(tier)}</strong> GB storage
                  </li>
                  <li>
                    <strong>{getDataTransferValue(tier)}</strong> GB data transfer
                  </li>
                  <li>
                    <strong>{tier.features?.network?.publicIPs || 1}</strong> public IPs
                  </li>
                </ul>
                
                <button 
                  className={`${styles.button} ${tier.id === selectedTier ? styles.outlineButton : styles.primaryButton}`}
                  onClick={() => handleChangePlan(tier.id)}
                  disabled={processing || tier.id === selectedTier}
                >
                  {tier.id === selectedTier 
                    ? 'Current Plan' 
                    : processing && tier.id === selectedTier
                      ? 'Processing...'
                      : 'Select Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}