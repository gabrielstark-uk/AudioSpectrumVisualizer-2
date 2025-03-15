import React, { useEffect, useState } from 'react';
import { useSubscription, SubscriptionStatus as Status } from '../../lib/subscription';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CalendarDays, CheckCircle, AlertCircle } from 'lucide-react';

export function SubscriptionStatus() {
  const { getStatus, cancel } = useSubscription();
  const [status, setStatus] = useState<Status>({ isSubscribed: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const currentStatus = await getStatus();
        setStatus(currentStatus);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [getStatus]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      const success = await cancel();
      if (success) {
        const updatedStatus = await getStatus();
        setStatus(updatedStatus);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading subscription information...</div>;
  }

  if (!status.isSubscribed && !status.trialDaysLeft) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Upgrade to access premium features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <span>Limited functionality available</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
            View Plans
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Subscription Status</CardTitle>
          {status.isSubscribed ? (
            <Badge variant="default" className="bg-green-600">Active</Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500 text-amber-500">Trial</Badge>
          )}
        </div>
        <CardDescription>
          {status.isSubscribed 
            ? `You're subscribed to the ${status.plan?.name} plan.` 
            : `You're currently in your free trial period.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.isSubscribed && status.plan && (
          <>
            <div>
              <div className="text-sm font-medium text-gray-500">Plan</div>
              <div>{status.plan.name} (${status.plan.price}/{status.plan.interval})</div>
            </div>
            
            {status.expiresAt && (
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Next billing date</div>
                  <div>{new Date(status.expiresAt).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </>
        )}

        {!status.isSubscribed && status.trialDaysLeft !== undefined && (
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-500">Trial Period</div>
              <div>{status.trialDaysLeft} days remaining</div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <div className="text-sm font-medium text-gray-500 mb-2">Features included:</div>
          <ul className="space-y-1">
            {status.plan?.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {status.isSubscribed ? (
          <>
            <Button variant="outline" onClick={handleCancel}>Cancel Subscription</Button>
            <Button onClick={() => window.location.href = '/pricing'}>Change Plan</Button>
          </>
        ) : (
          <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
            Upgrade Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}