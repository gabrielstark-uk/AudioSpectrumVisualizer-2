import React from "react";
import { NavBar } from "../components/NavBar";

export default function Account() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="border rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Your Name"
                    defaultValue="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                    placeholder="your@email.com"
                    defaultValue="john.doe@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Tell us about yourself"
                    defaultValue="Audio engineer with 5 years of experience in sound design and frequency analysis."
                  />
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Security</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded-md"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded-md"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded-md"
                    placeholder="••••••••"
                  />
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Update Password
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="border rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Subscription</h2>
              <div className="mb-4">
                <div className="text-lg font-medium">Current Plan</div>
                <div className="text-2xl font-bold text-primary">Professional</div>
                <div className="text-sm text-muted-foreground">$9.99/month</div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium">Next billing date</div>
                <div>June 15, 2023</div>
              </div>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Upgrade Plan
                </button>
                <button className="w-full px-4 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive/10">
                  Cancel Subscription
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Account Actions</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 border rounded-md hover:bg-muted">
                  Download My Data
                </button>
                <button className="w-full px-4 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive/10">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}