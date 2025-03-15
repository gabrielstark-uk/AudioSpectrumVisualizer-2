import { getApiBaseUrl } from './electron-bridge';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan?: SubscriptionPlan;
  expiresAt?: string;
  trialDaysLeft?: number;
}

// Define subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic',
    description: 'Essential audio visualization features',
    price: 4.99,
    interval: 'month',
    features: [
      'Real-time audio spectrum visualization',
      'Basic frequency analysis',
      'Standard visualization themes',
      'Export as image'
    ]
  },
  {
    id: 'basic-yearly',
    name: 'Basic (Annual)',
    description: 'Essential audio visualization features',
    price: 49.99,
    interval: 'year',
    features: [
      'Real-time audio spectrum visualization',
      'Basic frequency analysis',
      'Standard visualization themes',
      'Export as image'
    ]
  },
  {
    id: 'pro-monthly',
    name: 'Professional',
    description: 'Advanced audio analysis and visualization',
    price: 9.99,
    interval: 'month',
    features: [
      'All Basic features',
      'Advanced frequency detection algorithms',
      'Harmful frequency alerts',
      'Custom visualization themes',
      'Export as video',
      'Audio recording'
    ]
  },
  {
    id: 'pro-yearly',
    name: 'Professional (Annual)',
    description: 'Advanced audio analysis and visualization',
    price: 99.99,
    interval: 'year',
    features: [
      'All Basic features',
      'Advanced frequency detection algorithms',
      'Harmful frequency alerts',
      'Custom visualization themes',
      'Export as video',
      'Audio recording'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for professional audio analysis',
    price: 199.99,
    interval: 'year',
    features: [
      'All Professional features',
      'Multi-device synchronization',
      'Advanced pattern recognition',
      'Neural network analysis',
      'API access',
      'Priority support',
      'Custom branding'
    ]
  }
];

// Subscription service class
export class SubscriptionService {
  private static instance: SubscriptionService;
  private apiUrl: string;
  private subscriptionStatus: SubscriptionStatus = { isSubscribed: false };
  private listeners: Array<(status: SubscriptionStatus) => void> = [];

  private constructor() {
    this.apiUrl = `${getApiBaseUrl()}/subscription`;
    this.loadSubscriptionStatus();
  }

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // Get current subscription status
  public async getStatus(): Promise<SubscriptionStatus> {
    await this.refreshStatus();
    return this.subscriptionStatus;
  }

  // Subscribe to a plan
  public async subscribe(planId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      await this.refreshStatus();
      return true;
    } catch (error) {
      console.error('Subscription error:', error);
      return false;
    }
  }

  // Cancel subscription
  public async cancel(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Cancellation failed');
      }

      await this.refreshStatus();
      return true;
    } catch (error) {
      console.error('Cancellation error:', error);
      return false;
    }
  }

  // Start a trial
  public async startTrial(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Trial activation failed');
      }

      await this.refreshStatus();
      return true;
    } catch (error) {
      console.error('Trial activation error:', error);
      return false;
    }
  }

  // Check if a feature is available based on subscription
  public canUseFeature(feature: string): boolean {
    // If not subscribed, only allow basic features
    if (!this.subscriptionStatus.isSubscribed) {
      const basicFeatures = [
        'Real-time audio spectrum visualization',
        'Basic frequency analysis'
      ];
      return basicFeatures.includes(feature);
    }

    // If subscribed, check if the feature is included in the plan
    if (!this.subscriptionStatus.plan) {
      return false;
    }

    return this.subscriptionStatus.plan.features.includes(feature);
  }

  // Add a listener for subscription changes
  public addListener(listener: (status: SubscriptionStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return a function to remove the listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Private methods
  private async refreshStatus(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/status`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const status = await response.json();
      this.subscriptionStatus = status;
      this.notifyListeners();
      this.saveSubscriptionStatus();
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.subscriptionStatus);
    });
  }

  private saveSubscriptionStatus(): void {
    localStorage.setItem('subscriptionStatus', JSON.stringify(this.subscriptionStatus));
  }

  private loadSubscriptionStatus(): void {
    const saved = localStorage.getItem('subscriptionStatus');
    if (saved) {
      try {
        this.subscriptionStatus = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved subscription status:', e);
      }
    }
  }
}

// Hook for using subscription in React components
export function useSubscription() {
  const service = SubscriptionService.getInstance();
  return {
    getStatus: () => service.getStatus(),
    subscribe: (planId: string) => service.subscribe(planId),
    cancel: () => service.cancel(),
    startTrial: () => service.startTrial(),
    canUseFeature: (feature: string) => service.canUseFeature(feature),
    addListener: (listener: (status: SubscriptionStatus) => void) => service.addListener(listener),
    plans: SUBSCRIPTION_PLANS
  };
}