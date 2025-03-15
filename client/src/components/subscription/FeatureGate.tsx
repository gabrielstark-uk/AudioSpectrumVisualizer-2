import React, { ReactNode, useEffect, useState } from 'react';
import { useSubscription } from '../../lib/subscription';
import { Button } from '../ui/button';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { canUseFeature, getStatus } = useSubscription();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      await getStatus(); // Refresh subscription status
      setHasAccess(canUseFeature(feature));
      setLoading(false);
    };

    checkAccess();
  }, [feature, canUseFeature, getStatus]);

  if (loading) {
    return <div className="p-4 animate-pulse bg-gray-100 rounded-md">Loading...</div>;
  }

  if (!hasAccess) {
    return fallback || (
      <div className="p-6 border border-dashed rounded-md bg-gray-50 flex flex-col items-center justify-center space-y-3">
        <Lock className="h-8 w-8 text-gray-400" />
        <div className="text-center">
          <h3 className="font-medium">Premium Feature</h3>
          <p className="text-sm text-gray-500 mb-3">
            This feature requires a subscription to access.
          </p>
          <Button 
            size="sm"
            onClick={() => window.location.href = '/pricing'}
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}