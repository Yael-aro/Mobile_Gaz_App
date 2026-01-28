import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { Loader2 } from 'lucide-react';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  user?: any;
  onSuccess: () => void;
}

export function UserForm({ open, onClose, user, onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'client',
        phone: user.phone || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'client',
        phone: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Mise à jour
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          name: formData.name,
          role: formData.role,
          phone: formData.phone
        });

        toast({
          title: "✅ Utilisateur mis à jour",
          description: "Les informations ont été modifiées avec succès",
        });
      } else {
        // Création
        if (!formData.password || formData.password.length < 6) {
          toast({
            title: "❌ Erreur",
            description: "Le mot de passe doit contenir au moins 6 caractères",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Ajouter les infos dans Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          createdAt: new Date()
        });

        toast({
          title: "✅ Utilisateur créé",
          description: `${formData.name} a été créé avec succès`,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error:', error);
      
      let errorMessage = "Une erreur s'est produite";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Email invalide";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Mot de passe trop faible";
      }

      toast({
        title: "❌ Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouveau compte utilisateur'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Mohamed Alami"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="exemple@email.com"
              required
              disabled={loading || !!user}
            />
            {user && (
              <p className="text-xs text-muted-foreground mt-1">
                L'email ne peut pas être modifié
              </p>
            )}
          </div>

          {!user && (
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 caractères"
                required
                disabled={loading}
              />
            </div>
          )}

          <div>
            <Label htmlFor="role">Rôle *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    Administrateur
                  </div>
                </SelectItem>
                <SelectItem value="cantinier">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Cantinier
                  </div>
                </SelectItem>
                <SelectItem value="client">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Client
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0612345678"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  En cours...
                </>
              ) : (
                user ? 'Modifier' : 'Créer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
