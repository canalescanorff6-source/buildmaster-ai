import { AuthGate } from '@/components/AuthGate';
import { CardVisionApp } from '@/components/CardVisionApp';

export default function HomePage() {
  return (
    <AuthGate>
      <CardVisionApp />
    </AuthGate>
  );
}
