'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import apiClient from '@/lib/api-client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import { Lock, ShoppingBag } from 'lucide-react';

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutForm() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }

    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setName(userData.name || '');
      setEmail(userData.email || '');
    }
  }, [items, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessing(true);
    setError('');

    try {
      // Create Razorpay order
      const orderResponse = await apiClient.post('/razorpay/create-order', {
        amount: total,
      });

      const { orderId, amount, currency, key } = orderResponse.data.data;

      const shippingAddress = `${address}, ${city}, ${postalCode}, ${country}`;

      // Initialize Razorpay checkout
      const options = {
        key, // Razorpay key
        amount, // Amount in paise
        currency,
        name: 'Your Store Name',
        description: 'Order Payment',
        order_id: orderId,
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: '#6366f1', // indigo-500
        },
        handler: async function (response: any) {
          try {
            // Payment successful - create order in database
            await apiClient.post('/orders', {
              items: items.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
              })),
              shippingAddress,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            clearCart();
            router.push('/orders?success=true');
          } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create order');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        setError('Razorpay SDK not loaded. Please refresh the page.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Shipping Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="+91 1234567890"
          />
          <div />
          <div className="md:col-span-2">
            <Input
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <Input
            label="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
          <div className="md:col-span-2">
            <Input
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isProcessing}
        isLoading={isProcessing}
        className="w-full"
        size="lg"
      >
        <Lock className="mr-2 h-5 w-5" />
        Pay {formatPrice(total)}
      </Button>

      <p className="text-center text-xs text-zinc-500">
        Your payment information is encrypted and secure
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, getTotal } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-zinc-950 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Checkout</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold text-white">Order Summary</h2>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-zinc-400">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-indigo-500">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
