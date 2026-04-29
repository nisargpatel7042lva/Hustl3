'use client';

import { useState } from 'react';
import { Mail, MessageSquare, User, Send } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-width-container px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="heading-xl text-slate-900 mb-4">Get in Touch</h1>
              <p className="text-lg text-slate-600">
                Have a question or feedback? We would love to hear from you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="card-clean p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <textarea
                      placeholder="How can we help?"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-accent flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-slate-600 mb-4">Prefer direct contact?</p>
              <div className="flex justify-center gap-4">
                <a
                  href="https://twitter.com/hustl3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-accent transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="https://discord.gg/hustl3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-accent transition-colors"
                >
                  Discord
                </a>
                <a
                  href="mailto:hello@hustl3.io"
                  className="text-slate-500 hover:text-accent transition-colors"
                >
                  hello@hustl3.io
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}