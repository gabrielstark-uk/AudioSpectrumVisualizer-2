import React from "react";
import { NavBar } from "../components/NavBar";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Pricing Plans</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Plan */}
          <div className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Basic</h2>
            <p className="text-muted-foreground mb-4">Essential audio visualization features</p>
            <div className="text-3xl font-bold mb-4">$4.99<span className="text-lg font-normal">/month</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Real-time audio spectrum visualization
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Basic frequency analysis
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Standard visualization themes
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Start Free Trial
            </button>
          </div>

          {/* Professional Plan */}
          <div className="border-2 border-primary rounded-lg p-6 shadow-md relative transform scale-105">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
              Popular
            </div>
            <h2 className="text-2xl font-bold mb-2">Professional</h2>
            <p className="text-muted-foreground mb-4">Advanced audio analysis and visualization</p>
            <div className="text-3xl font-bold mb-4">$9.99<span className="text-lg font-normal">/month</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                All Basic features
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Advanced frequency detection algorithms
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Harmful frequency alerts
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Custom visualization themes
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Start Free Trial
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Enterprise</h2>
            <p className="text-muted-foreground mb-4">Complete solution for professional audio analysis</p>
            <div className="text-3xl font-bold mb-4">$199.99<span className="text-lg font-normal">/year</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                All Professional features
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Multi-device synchronization
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Advanced pattern recognition
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Priority support
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Start Free Trial
            </button>
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">What happens after my free trial?</h3>
              <p className="text-muted-foreground">
                After your 14-day free trial ends, you'll be charged for the plan you selected.
                You can cancel anytime before the trial ends to avoid being charged.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Can I change plans later?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. When upgrading,
                you'll get immediate access to the new features. When downgrading, the change
                will take effect at the end of your current billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">How do I cancel my subscription?</h3>
              <p className="text-muted-foreground">
                You can cancel your subscription at any time from your account settings.
                After cancellation, you'll continue to have access until the end of your
                current billing period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Is there a refund policy?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee. If you're not satisfied with our
                service within the first 30 days of your paid subscription, contact our
                support team for a full refund.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Do you offer discounts?</h3>
              <p className="text-muted-foreground">
                We offer a 16% discount on all annual plans. We also have special pricing
                for educational institutions and non-profit organizations. Contact our
                sales team for more information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
