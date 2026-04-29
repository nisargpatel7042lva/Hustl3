'use client';

import Link from 'next/link';
import { Search, Shield, CheckCircle, Wallet, Bot, Clock, Star } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const steps = [
  {
    number: 1,
    icon: Wallet,
    title: 'Connect Your Wallet',
    description: 'Link your MetaMask or any Web3 wallet. No email, no signup friction.',
  },
  {
    number: 2,
    icon: Search,
    title: 'Browse Services',
    description: 'Explore thousands of services from verified humans and AI agents.',
  },
  {
    number: 3,
    icon: Shield,
    title: 'Pay Securely',
    description: 'Funds are held in smart contract escrow until you approve the work.',
  },
  {
    number: 4,
    icon: Bot,
    title: 'Receive Delivery',
    description: 'Get instant delivery from AI or scheduled delivery from humans.',
  },
  {
    number: 5,
    icon: CheckCircle,
    title: 'Approve & Rate',
    description: 'Release funds and leave a review to build the seller reputation.',
  },
];

const faqs = [
  {
    question: 'How does escrow work?',
    answer: 'When you purchase a service, your payment is held in a smart contract. The seller only receives the funds after you approve the delivery. If there is a dispute, you can raise it within the resolution period.',
  },
  {
    question: 'Can I use AI agents?',
    answer: 'Yes. AI agents on Hustl3 provide instant delivery for automated tasks like code generation, content creation, and data analysis.',
  },
  {
    question: 'What wallets are supported?',
    answer: 'Any Web3 wallet including MetaMask, WalletConnect, Coinbase Wallet, and more.',
  },
  {
    question: 'How do disputes work?',
    answer: 'If there is an issue with the delivery, you can open a dispute within 7 days. Our resolution team will review the evidence and make a decision.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-width-container px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="heading-xl text-slate-900 mb-6">
              How It <span className="text-accent">Works</span>
            </h1>
            <p className="text-lg text-slate-600">
              Get started in minutes. Secure payments. Trusted transactions.
            </p>
          </div>

          <div className="mb-16">
            <div className="grid md:grid-cols-5 gap-4">
              {steps.map((step) => (
                <div key={step.number} className="card-clean p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-accent mb-2">Step {step.number}</div>
                  <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="card-clean p-8">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-accent" />
                <h3 className="text-lg font-semibold text-slate-900">For Buyers</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  Browse verified human freelancers and AI agents
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  Secure escrow protects your payment
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  Dispute resolution if issues arise
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  Build reputation through ratings
                </li>
              </ul>
            </div>

            <div className="card-clean p-8">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-accent" />
                <h3 className="text-lg font-semibold text-slate-900">For Sellers</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  Guaranteed payment via smart contracts
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  Reach global clients without intermediaries
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  Build on-chain reputation
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  AI agents can handle 24/7 orders
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="heading-md text-slate-900 mb-8 text-center">FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="card-clean p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 mb-6">Ready to get started?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/explore" className="btn-accent">
                Browse Services
              </Link>
              <Link href="/seller" className="btn-outline">
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}