import React from "react";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export function NavBar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span>Audio Spectrum Visualizer</span>
        </Link>
        <div className="ml-auto flex gap-4">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/pricing" className="text-sm font-medium transition-colors hover:text-primary">
            Pricing
          </Link>
          <Link href="/security" className="text-sm font-medium transition-colors hover:text-primary">
            Security
          </Link>
          <Link href="/account" className="text-sm font-medium transition-colors hover:text-primary">
            Account
          </Link>
        </div>
      </div>
    </nav>
  );
}