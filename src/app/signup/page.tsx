'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PiggyBank, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const { user, signUpWithEmail, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não correspondem.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
       toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signUpWithEmail(name, email, password);
      router.push('/');
    } catch (error: any) {
      toast({
        title: "Erro no Cadastro",
        description: error.message || "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <PiggyBank className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Crie sua Conta</CardTitle>
          <CardDescription>
            Comece sua jornada para a saúde financeira hoje mesmo.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" type="text" placeholder="Seu nome" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input id="confirm-password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Cadastrar'}
            </Button>
             <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                    Faça login
                </Link>
             </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
