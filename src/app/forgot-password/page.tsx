'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PiggyBank, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setEmailSent(true);
      toast({
        title: "Email Enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o email. Verifique o endereço e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <PiggyBank className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
          <CardDescription>
            {emailSent 
              ? "Um link de recuperação foi enviado para o seu email."
              : "Digite seu email para receber um link de redefinição de senha."
            }
          </CardDescription>
        </CardHeader>
        {!emailSent ? (
          <form onSubmit={handleResetPassword}>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enviar Email de Recuperação'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                  Lembrou a senha?{' '}
                  <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                      Faça login
                  </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <CardContent>
            <div className="text-center">
                <p className="text-muted-foreground mb-4">Se não encontrar o email, verifique sua pasta de spam.</p>
                <Link href="/login">
                  <Button variant="outline">Voltar para o Login</Button>
                </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
