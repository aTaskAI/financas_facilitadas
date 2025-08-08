'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PiggyBank, Loader2, User, Heart, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updatePassword } from 'firebase/auth';

export default function ProfilePage() {
  const { user, userData, updateUserData, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [nome, setNome] = useState('');
  const [nomeConjuge, setNomeConjuge] = useState('');
  const [renda, setRenda] = useState(0);
  const [rendaConjuge, setRendaConjuge] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (userData) {
        setNome(userData.nome);
        setNomeConjuge(userData.nomeConjuge || '');
        setRenda(userData.renda);
        setRendaConjuge(userData.rendaConjuge || 0);
    }
  }, [user, userData, loading, router]);
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateUserData({
        nome,
        nomeConjuge: nomeConjuge || undefined,
        renda,
        rendaConjuge: rendaConjuge || undefined,
      });

      if (password) {
        if (password !== confirmPassword) {
            toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive'});
            setIsLoading(false);
            return;
        }
        if (user) {
            await updatePassword(user, password);
            toast({ title: 'Sucesso!', description: 'Sua senha foi alterada. Por favor, faça login novamente.'});
            await logout();
        }
      } else {
        toast({ title: 'Sucesso!', description: 'Seus dados foram atualizados.'});
      }

    } catch (error: any) {
        toast({ title: 'Erro', description: `Não foi possível atualizar os dados: ${error.message}`, variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };

  if (loading || !user || !userData) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <PiggyBank className="h-12 w-12 animate-bounce text-primary" />
        </div>
      )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
       <div className="absolute top-4 left-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback>{nome.charAt(0)}</AvatarFallback>
            </Avatar>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Atualize suas informações pessoais e de segurança.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-6">
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
                <h3 className="flex items-center font-semibold"><Heart className="mr-2 h-5 w-5" /> Dados do Cônjuge</h3>
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

             <div className="space-y-4 rounded-md border p-4">
                <h3 className="flex items-center font-semibold"><User className="mr-2 h-5 w-5" /> Alterar Senha</h3>
                 <div>
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
