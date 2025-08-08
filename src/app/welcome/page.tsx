'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PiggyBank, Loader2, User, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WelcomePage() {
  const { user, userData, updateUserData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [nome, setNome] = useState('');
  const [nomeConjuge, setNomeConjuge] = useState('');
  const [renda, setRenda] = useState(0);
  const [rendaConjuge, setRendaConjuge] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
     if (!loading && user && userData) {
      // User already has data, redirect away from welcome
      router.push('/');
    }
  }, [user, userData, loading, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!nome || renda <= 0) {
        toast({ title: 'Erro', description: 'Por favor, preencha seu nome e sua renda.', variant: 'destructive'});
        setIsLoading(false);
        return;
    }

    try {
      await updateUserData({
        nome,
        nomeConjuge: nomeConjuge || undefined,
        renda,
        rendaConjuge: rendaConjuge || undefined,
        photoURL: user?.photoURL || '',
      });
      toast({ title: 'Sucesso!', description: 'Seus dados foram salvos.'});
      router.push('/');
    } catch (error: any) {
        toast({ title: 'Erro', description: `Não foi possível salvar os dados: ${error.message}`, variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };

  if (loading || !user) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <PiggyBank className="h-12 w-12 animate-bounce text-primary" />
        </div>
      )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Bem-vindo(a) ao Finanças Simplificadas!</CardTitle>
          <CardDescription>Vamos começar com algumas informações básicas para personalizar sua experiência.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 rounded-md border p-4">
                <h3 className="flex items-center font-semibold"><User className="mr-2 h-5 w-5" /> Seus Dados</h3>
                 <div>
                    <Label htmlFor="nome">Seu Nome</Label>
                    <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="renda">Sua Renda Mensal (R$)</Label>
                    <Input
                        id="renda"
                        type="number"
                        value={renda}
                        onChange={(e) => setRenda(Number(e.target.value))}
                        required
                    />
                </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
                <h3 className="flex items-center font-semibold"><Heart className="mr-2 h-5 w-5" /> Dados do Cônjuge (Opcional)</h3>
                <div>
                    <Label htmlFor="nomeConjuge">Nome do Cônjuge</Label>
                    <Input
                        id="nomeConjuge"
                        value={nomeConjuge}
                        onChange={(e) => setNomeConjuge(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="rendaConjuge">Renda Mensal do Cônjuge (R$)</Label>
                    <Input
                        id="rendaConjuge"
                        type="number"
                        value={rendaConjuge}
                        onChange={(e) => setRendaConjuge(Number(e.target.value))}
                    />
                </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar e Começar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
