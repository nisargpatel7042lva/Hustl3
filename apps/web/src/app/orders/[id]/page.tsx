'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';
import { useParams } from 'next/navigation';

export default function OrderFlowPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchOrder();
  }, [params.id]);

  const handleAction = async (action: 'approve' | 'dispute' | 'deliver' | 'rate') => {
    try {
      let body = {};
      if (action === 'rate') {
        body = { rating, reviewText: review, raterAddress: order.buyerWallet };
      } else if (action === 'deliver') {
        body = { deliverableURI: '0g://test_delivery_uri' };
      }

      const res = await fetch(`/api/orders/${params.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        await fetchOrder(); // Refresh state
      } else {
        alert(`${action} failed`);
      }
    } catch (err) {
      console.error(err);
      alert(`Error processing ${action}`);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Order...</div>;
  if (error || !order) return <div className="p-8 text-center text-red-500">{error || 'Order not found'}</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ paddingTop: '80px', flexGrow: 1 }} className="container-app p-8">
        <h1 className="text-2xl font-bold mb-4">Order #{order.orderId.slice(0, 8)}</h1>
        
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Status: <span className="text-accent">{order.state}</span></span>
            <span className="text-sm text-gray-500">Created: {new Date(order.createdAt).toLocaleString()}</span>
          </div>
          
          <div className="mb-4">
            <p className="font-semibold">Gig ID:</p>
            <p className="font-mono text-sm">{order.gigId}</p>
          </div>
          
          <div className="mb-4">
            <p className="font-semibold">Buyer:</p>
            <p className="font-mono text-sm">{order.buyerWallet}</p>
          </div>
          
          <div className="mb-6">
            <p className="font-semibold">Seller:</p>
            <p className="font-mono text-sm">{order.sellerWallet}</p>
          </div>

          <div className="flex gap-4">
            {order.state === 'PAYMENT_PENDING' && (
              <button className="btn btn-primary" onClick={() => handleAction('deliver')}>Simulate Delivery</button>
            )}
            
            {order.state === 'DELIVERED' && (
              <>
                <button className="btn btn-primary" onClick={() => handleAction('approve')}>
                  <CheckCircle size={16} className="mr-2"/> Approve & Release
                </button>
                <button className="btn btn-secondary text-red-500 border-red-500" onClick={() => handleAction('dispute')}>
                  <AlertTriangle size={16} className="mr-2"/> Dispute
                </button>
              </>
            )}

            {order.state === 'COMPLETED' && !order.isRated && (
              <div className="w-full flex gap-4 items-center">
                <input 
                  type="number" min="1" max="5" 
                  value={rating} onChange={e => setRating(Number(e.target.value))} 
                  className="input w-24"
                />
                <input 
                  type="text" placeholder="Leave a review..." 
                  value={review} onChange={e => setReview(e.target.value)}
                  className="input flex-grow"
                />
                <button className="btn btn-primary" onClick={() => handleAction('rate')}>Submit Rating</button>
              </div>
            )}
            
            {order.state === 'COMPLETED' && order.isRated && (
              <p className="text-green-500 font-semibold">✓ Order Completed and Rated</p>
            )}
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="font-bold mb-4">Event Log</h2>
          <div className="flex flex-col gap-2">
            {order.history?.map((evt: any, i: number) => (
              <div key={i} className="flex justify-between text-sm border-b border-gray-800 pb-2">
                <span className="font-mono">{evt.state}</span>
                <span className="text-gray-500">{new Date(evt.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
