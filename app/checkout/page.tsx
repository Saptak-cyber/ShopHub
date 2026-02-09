'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '@/store/cart';
import apiClient from '@/lib/api-client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import { Lock, ShoppingBag } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { items, getTotal, clearCart } = useCartStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
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
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const paymentIntentResponse = await apiClient.post('/stripe/create-payment-intent', {
        amount: total,
      });

      const { clientSecret } = paymentIntentResponse.data.data;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name,
              email,
              address: {
                line1: address,
                city,
                postal_code: postalCode,
                country,
              },
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        const shippingAddress = `${address}, ${city}, ${postalCode}, ${country}`;
        
        await apiClient.post('/orders', {
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          shippingAddress,
          stripePaymentId: paymentIntent.id,
        });

        clearCart();
        router.push('/orders?success=true');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
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

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Payment Information</h2>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#fafafa',
                  '::placeholder': {
                    color: '#71717a',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
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
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
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
