'use client';

import { Shield, Zap, Globe, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WalletConnectButton } from '@/components/web3/WalletConnectButton';
import { useWallet } from '@/lib/hooks/useWallet';

const features = [
  {
    icon: Shield,
    title: 'Secure',
    description: 'Your keys, your crypto. We never have access to your funds.',
  },
  {
    icon: Zap,
    title: 'Fast',
    description: 'Sign once, pay instantly. No waiting for bank transfers.',
  },
  {
    icon: Globe,
    title: 'Global',
    description: 'Pay anyone, anywhere in the world with just an address.',
  },
];

export default function ConnectPage() {
  const { address, isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-width-container px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="heading-xl text-slate-900 mb-4">
                {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
              </h1>
              <p className="text-lg text-slate-600">
                {isConnected
                  ? 'Your wallet is now connected to Hustl3. Start exploring services.'
                  : 'Choose a wallet to start using Hustl3. Your wallet is your identity.'}
              </p>
            </div>

            {isConnected ? (
              <div className="card-clean p-8 text-center mb-12">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <p className="text-sm text-slate-500 mb-2">Connected Wallet</p>
                <p className="font-mono text-lg text-slate-900 mb-6">
                  {address}
                </p>
                <WalletConnectButton />
              </div>
            ) : (
              <div className="card-clean p-8 mb-12">
                <p className="text-center text-slate-600 mb-6">
                  Select a wallet to connect
                </p>
                <WalletConnectButton />
              </div>
            )}

            <div className="card-clean p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Why connect a wallet?</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {features.map((feature) => (
                  <div key={feature.title} className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-2">
                      <feature.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="font-medium text-slate-900 text-sm">{feature.title}</div>
                    <div className="text-xs text-slate-500">{feature.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 mt-8">
              By connecting, you agree to our{' '}
              <a href="/terms" className="text-accent hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}