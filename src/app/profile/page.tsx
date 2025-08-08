'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const profileSchema = z.object({
  displayName: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não correspondem.",
  path: ["confirmPassword"],
});


export default function ProfilePage() {
  const { user, loading, updateUserProfile, updateUserPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { control: profileControl, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, setValue: setProfileValue } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
    }
  });

  const { control: passwordControl, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setProfileValue('displayName', user.displayName || '');
    }
  }, [user, loading, router, setProfileValue]);

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!updateUserProfile) return;
    setIsProfileSaving(true);
    try {
      await updateUserProfile(data.displayName, newPhoto);
      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado.",
      });
      setNewPhoto(null);
      setPhotoPreview(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
     if (!updateUserPassword || !user) return;
     // Do not allow password change for Google provider
     if (user.providerData.some(p => p.providerId === 'google.com')) {
        toast({
            title: "Ação não permitida",
            description: "Você não pode alterar a senha de uma conta logada com o Google.",
            variant: "destructive",
        });
        return;
     }

    setIsPasswordSaving(true);
    try {
      await updateUserPassword(data.newPassword);
      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada.",
      });
      resetPasswordForm();
    } catch (error: any) {
       toast({
        title: "Erro",
        description: error.message || `Não foi possível alterar a senha.`,
        variant: "destructive",
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  const isGoogleProvider = user.providerData.some(p => p.providerId === 'google.com');

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
         <h1 className="text-3xl font-bold">Meu Perfil</h1>
         <Link href="/">
           <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
           </Button>
         </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seu nome e foto de perfil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={photoPreview || user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Input id="picture" type="file" onChange={handlePhotoChange} accept="image/*" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome</Label>
                  <Controller
                    name="displayName"
                    control={profileControl}
                    render={({ field }) => <Input {...field} id="displayName" />}
                  />
                  {profileErrors.displayName && <p className="text-sm text-red-500">{profileErrors.displayName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isProfileSaving}>
                  {isProfileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
        </form>

        <div className="space-y-8">
           <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
               <CardDescription>Defina uma nova senha de acesso.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                   <Controller
                    name="newPassword"
                    control={passwordControl}
                    render={({ field }) => <Input {...field} id="newPassword" type="password" disabled={isGoogleProvider} />}
                  />
                  {passwordErrors.newPassword && <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Controller
                    name="confirmPassword"
                    control={passwordControl}
                    render={({ field }) => <Input {...field} id="confirmPassword" type="password" disabled={isGoogleProvider} />}
                  />
                  {passwordErrors.confirmPassword && <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>}
                </div>
                {isGoogleProvider && <p className="text-xs text-muted-foreground pt-2">Você não pode alterar a senha de uma conta logada com o Google.</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPasswordSaving || isGoogleProvider}>
                  {isPasswordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Alterar Senha
                </Button>
              </CardFooter>
            </form>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                   <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Selecione o tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
