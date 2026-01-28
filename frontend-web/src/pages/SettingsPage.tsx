import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Bell, Shield, Database, Palette, Globe, Sun, Moon, Monitor, Languages, Trash2, Download, Info, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateProfile, updatePassword, updateEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // États de chargement
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // États pour les paramètres
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [movementAlerts, setMovementAlerts] = useState(true);
  const [language, setLanguage] = useState('fr');
  const [theme, setTheme] = useState('light');
  const [stockThreshold, setStockThreshold] = useState('30');

  // Profil utilisateur
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Mots de passe
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSaveProfile = async () => {
    if (!auth.currentUser || !user) return;

    setLoadingProfile(true);
    try {
      // Mettre à jour le displayName dans Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: profile.name
      });

      // Mettre à jour les infos dans Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: profile.name,
        phone: profile.phone
      });

      toast({
        title: "✅ Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser) return;

    // Validations
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: "❌ Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "❌ Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: "❌ Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setLoadingPassword(true);
    try {
      // Mettre à jour le mot de passe
      await updatePassword(auth.currentUser, passwords.new);

      toast({
        title: "✅ Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès",
      });

      // Réinitialiser les champs
      setPasswords({
        current: '',
        new: '',
        confirm: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      let errorMessage = "Impossible de changer le mot de passe";
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Pour des raisons de sécurité, veuillez vous reconnecter avant de changer votre mot de passe";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Le mot de passe est trop faible";
      }

      toast({
        title: "❌ Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleSaveNotifications = () => {
    // Sauvegarder dans localStorage pour persister les préférences
    localStorage.setItem('notifications', JSON.stringify({
      email: emailNotifications,
      push: pushNotifications,
      stock: stockAlerts,
      movements: movementAlerts,
      threshold: stockThreshold
    }));

    toast({
      title: "✅ Notifications mises à jour",
      description: "Vos préférences ont été sauvegardées",
    });
  };

  const handleExportData = () => {
    toast({
      title: "📦 Export en cours",
      description: "Vos données sont en cours d'export...",
    });
    // TODO: Implémenter l'export réel
  };

  const handleClearCache = () => {
    // Garder les préférences importantes
    const notifications = localStorage.getItem('notifications');
    
    localStorage.clear();
    
    // Restaurer les préférences
    if (notifications) {
      localStorage.setItem('notifications', notifications);
    }

    toast({
      title: "🧹 Cache vidé",
      description: "Le cache de l'application a été nettoyé",
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos préférences et paramètres de compte</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Palette className="h-4 w-4 mr-2" />
            Préférences
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Données
          </TabsTrigger>
        </TabsList>

        {/* Profil */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations du Profil</CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={loadingProfile}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  L'email ne peut pas être modifié pour des raisons de sécurité
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={loadingProfile}
                  placeholder="0612345678"
                />
              </div>

              <div className="space-y-2">
                <Label>Rôle</Label>
                <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="capitalize font-medium">{user?.role}</span>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loadingProfile}>
                {loadingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Sauvegarder les modifications
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de Notifications</CardTitle>
              <CardDescription>Gérez comment vous recevez les notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications Email
                  </Label>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications Push
                  </Label>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications push</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Alertes de Stock
                  </Label>
                  <p className="text-sm text-muted-foreground">Alertes quand le stock est bas</p>
                </div>
                <Switch checked={stockAlerts} onCheckedChange={setStockAlerts} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Alertes de Mouvements
                  </Label>
                  <p className="text-sm text-muted-foreground">Notifications des mouvements de bouteilles</p>
                </div>
                <Switch checked={movementAlerts} onCheckedChange={setMovementAlerts} />
              </div>

              <div className="space-y-2">
                <Label>Seuil d'Alerte de Stock (%)</Label>
                <Select value={stockThreshold} onValueChange={setStockThreshold}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="40">40%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Recevoir une alerte quand le stock descend sous {stockThreshold}%
                </p>
              </div>

              <Button onClick={handleSaveNotifications}>
                <Download className="h-4 w-4 mr-2" />
                Sauvegarder les préférences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sécurité */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du Compte</CardTitle>
              <CardDescription>Gérez la sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input 
                  id="current-password" 
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  disabled={loadingPassword}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  disabled={loadingPassword}
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  disabled={loadingPassword}
                />
              </div>

              <Button onClick={handleChangePassword} disabled={loadingPassword}>
                {loadingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </>
                )}
              </Button>

              <div className="pt-6 border-t">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Sessions Actives
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Actuelle</p>
                      <p className="text-sm text-muted-foreground">
                        {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                         navigator.userAgent.includes('Safari') ? 'Safari' : 
                         navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Navigateur'} sur {
                         navigator.platform.includes('Mac') ? 'MacOS' :
                         navigator.platform.includes('Win') ? 'Windows' :
                         navigator.platform.includes('Linux') ? 'Linux' : 'Système'
                        }
                      </p>
                    </div>
                    <span className="text-sm text-green-500 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      Actif
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Préférences */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences d'Affichage</CardTitle>
              <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Langue
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Thème
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Clair
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Sombre
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Système
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode Compact</Label>
                  <p className="text-sm text-muted-foreground">Affichage plus dense des données</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">Activer les animations de l'interface</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button>
                <Download className="h-4 w-4 mr-2" />
                Sauvegarder les préférences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Données */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Données</CardTitle>
              <CardDescription>Exportez ou gérez vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Export des Données
                </h4>
                <p className="text-sm text-muted-foreground">
                  Téléchargez une copie complète de vos données
                </p>
                <Button onClick={handleExportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter toutes les données
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Cache de l'Application
                </h4>
                <p className="text-sm text-muted-foreground">
                  Vider le cache peut résoudre certains problèmes
                </p>
                <Button onClick={handleClearCache} variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider le cache
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium text-destructive flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Zone de Danger
                </h4>
                <p className="text-sm text-muted-foreground">
                  Actions irréversibles sur votre compte
                </p>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer mon compte
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Informations de l'Application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Backend</span>
                <span className="text-sm font-medium font-mono text-xs">localhost:3001</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Environnement</span>
                <span className="text-sm font-medium">Développement</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
