'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useToastStore } from '@/store/toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Show user-friendly error message
        const errorMessage = result.error === 'CredentialsSignin' 
          ? 'Invalid email or password' 
          : result.error;
        setError(errorMessage);
        addToast(errorMessage, 'error');
      } else if (result?.ok) {
        addToast('Login successful! Welcome back.', 'success');
        router.push('/products');
      }
    } catch (err: any) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
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
          <CardTitle>Welcome Back</CardTitle>
          <p className="text-sm text-zinc-400 mt-2">
            Sign in to your account to continue shopping
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Google Sign-In */}
            <GoogleSignInButton text="Sign in with Google" callbackUrl="/products" />

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

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <div className="text-center text-sm">
              <span className="text-zinc-400">Don't have an account? </span>
              <Link
                href="/register"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Sign up
              </Link>
            </div>

            <div className="border-t border-zinc-800 pt-4 mt-4">
              <p className="text-xs text-zinc-500 text-center">
                Demo credentials:
                <br />
                Admin: admin@example.com / admin123
                <br />
                User: user@example.com / user123
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
