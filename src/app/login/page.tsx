'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <PiggyBank className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
          <CardDescription>
            Faça login para acessar seu painel financeiro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Carregando...' : 'Entrar com Google'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
