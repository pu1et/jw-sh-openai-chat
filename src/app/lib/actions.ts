'use server';

import { signIn } from '@/app/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ): Promise<string | undefined> {
    try {
      await signIn('credentials', formData);
      return undefined;
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
  }
  
