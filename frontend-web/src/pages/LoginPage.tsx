import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, AlertCircle, Package } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, signIn, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Charger email sauvegardé si "Se souvenir de moi" était coché
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setCredentials(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!credentials.email || !credentials.password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      await signIn(credentials.email, credentials.password);

      // Sauvegarder email si "Se souvenir de moi"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', credentials.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // La navigation est gérée par useEffect
    } catch (err: any) {
      console.error('Login error:', err);
      
      let errorMessage = 'Erreur de connexion';
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Veuillez entrer un email valide');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetEmailSent(true);
      setError('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      let errorMessage = 'Erreur lors de l\'envoi';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string, password: string) => {
    setCredentials({ email, password });
    setError('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Eluxtan</CardTitle>
          <CardDescription>
            {showResetForm ? 'Réinitialiser votre mot de passe' : 'Connectez-vous à votre compte'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!showResetForm ? (
            // FORMULAIRE DE CONNEXION
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  disabled={loading}
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => {
                      setShowResetForm(true);
                      setError('');
                      setResetEmail(credentials.email);
                    }}
                  >
                    Mot de passe oublié?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    disabled={loading}
                    autoComplete="current-password"
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={loading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Se souvenir de moi
                </label>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              {/* Connexions rapides pour tests */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Connexion rapide (test uniquement)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('admin@eluxtan.com', 'Admin123!')}
                    disabled={loading}
                    className="text-xs"
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('cantinier@eluxtan.com', 'Cantinier123!')}
                    disabled={loading}
                    className="text-xs"
                  >
                    Cantinier
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('client@test.com', 'Client123!')}
                    disabled={loading}
                    className="text-xs"
                  >
                    Client
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            // FORMULAIRE DE RÉINITIALISATION
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {resetEmailSent ? (
                <Alert className="border-green-200 bg-green-50">
                  <Mail className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Un email de réinitialisation a été envoyé à <strong>{resetEmail}</strong>. 
                    Vérifiez votre boîte de réception et vos spams.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={loading}
                      autoComplete="email"
                      className="h-11"
                    />
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer le lien de réinitialisation
                      </>
                    )}
                  </Button>
                </>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowResetForm(false);
                  setResetEmailSent(false);
                  setError('');
                }}
                disabled={loading}
              >
                Retour à la connexion
              </Button>
            </form>
          )}
        </CardContent>

        <div className="px-6 pb-6">
          <p className="text-xs text-center text-muted-foreground">
            © 2025 Eluxtan - Tous droits réservés
          </p>
        </div>
      </Card>
    </div>
  );
}
