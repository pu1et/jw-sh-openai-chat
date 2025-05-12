'use client';

import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/chat';
  const [error, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <input name="email" type="email" placeholder="Email" required className="border p-2 w-full" />
      <input name="password" type="password" placeholder="Password" required className="border p-2 w-full" />
      <input type="hidden" name="redirectTo" value={callbackUrl} />
      <button disabled={isPending} className="bg-blue-500 text-white px-4 py-2 rounded">
        {isPending ? 'Logging in...' : 'Log in'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
