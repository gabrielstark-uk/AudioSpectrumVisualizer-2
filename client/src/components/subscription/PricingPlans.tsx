import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS, useSubscription, SubscriptionPlan } from '../../lib/subscription';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Check } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export function PricingPlans() {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const { subscribe } = useSubscription();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    const success = await subscribe(plan.id);
    if (success) {
      // Show success message or redirect
      window.location.href = '/dashboard';
    }
  };

  const filteredPlans = SUBSCRIPTION_PLANS.filter(plan => 
    plan.id === 'enterprise' || plan.interval === billingCycle
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your needs. All plans include a 14-day free trial.
        </p>
        
        <div className="flex items-center justify-center mt-6">
          <Label htmlFor="billing-cycle" className={billingCycle === 'month' ? 'font-bold' : ''}>Monthly</Label>
          <Switch 
            id="billing-cycle" 
            className="mx-4"
            checked={billingCycle === 'year'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'year' : 'month')}
          />
          <Label htmlFor="billing-cycle" className={billingCycle === 'year' ? 'font-bold' : ''}>
            Yearly <span className="text-green-600 text-sm">(Save 16%)</span>
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className={plan.id.includes('pro') ? 'border-primary shadow-lg' : ''}>
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/{plan.interval}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.id.includes('pro') ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan)}
              >
                Start Free Trial
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-10 text-sm text-gray-500">
        <p>All plans come with a 14-day free trial. No credit card required to start.</p>
        <p className="mt-2">Need a custom solution? <a href="/contact" className="text-primary underline">Contact us</a> for enterprise pricing.</p>
      </div>
    </div>
  );
}