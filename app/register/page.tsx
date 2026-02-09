'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useToastStore } from '@/store/toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/products');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        addToast('Account created successfully! Welcome to ShopHub.', 'success');
        setTimeout(() => {
          router.push('/products');
        }, 500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <p className="text-sm text-zinc-400 mt-2">
            Sign up to start shopping
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Google Sign-Up */}
            <GoogleSignInButton text="Sign up with Google" callbackUrl="/products" />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with email</span>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>

            <div className="text-center text-sm">
              <span className="text-zinc-400">Already have an account? </span>
              <Link
                href="/login"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
