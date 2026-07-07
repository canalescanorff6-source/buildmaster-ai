import { redirect } from 'next/navigation';
import { AuthForm } from '@/app/(auth)/_components/auth-form';
import { getCurrentUser } from '@/lib/auth';

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');
  return <AuthForm mode="register" />;
}
