import React from 'react';
import { PricingPlans } from '../components/subscription/PricingPlans';

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the perfect plan for your audio visualization needs.
          All plans include a 14-day free trial.
        </p>
      </div>
      
      <PricingPlans />
      
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">What happens after my free trial?</h3>
            <p className="text-gray-600">
              After your 14-day free trial ends, you'll be charged for the plan you selected.
              You can cancel anytime before the trial ends to avoid being charged.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Can I change plans later?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. When upgrading,
              you'll get immediate access to the new features. When downgrading, the change
              will take effect at the end of your current billing cycle.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">How do I cancel my subscription?</h3>
            <p className="text-gray-600">
              You can cancel your subscription at any time from your account settings.
              After cancellation, you'll continue to have access until the end of your
              current billing period.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Is there a refund policy?</h3>
            <p className="text-gray-600">
              We offer a 30-day money-back guarantee. If you're not satisfied with our
              service within the first 30 days of your paid subscription, contact our
              support team for a full refund.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Do you offer discounts?</h3>
            <p className="text-gray-600">
              We offer a 16% discount on all annual plans. We also have special pricing
              for educational institutions and non-profit organizations. Contact our
              sales team for more information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}