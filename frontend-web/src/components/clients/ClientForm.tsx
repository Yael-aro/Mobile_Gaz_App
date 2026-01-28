import { useState, useEffect } from 'react';
import { useBottles } from '@/contexts/BottleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  client?: any;
}

export function ClientForm({ open, onClose, client }: ClientFormProps) {
  const { addClient, updateClient } = useBottles();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sendInvitation, setSendInvitation] = useState(!client);
  const [invitationSent, setInvitationSent] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || ''
      });
      setSendInvitation(false);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
      setSendInvitation(true);
      setInvitationSent(false);
      setTempPassword('');
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (client) {
        // Mise à jour simple
        await updateClient(client.id, formData);
        toast({
          title: "✅ Client mis à jour",
          description: "Les informations du client ont été modifiées.",
        });
        onClose();
      } else {
        // Création avec ou sans invitation
        if (sendInvitation) {
          // Validation email
          if (!formData.email || !formData.email.includes('@')) {
            toast({
              title: "❌ Erreur",
              description: "Veuillez entrer un email valide",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }

          // Créer avec invitation email
          const response = await fetch('http://localhost:3001/api/invitations/invite-client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la création');
          }

          const result = await response.json();
          
          setInvitationSent(true);
          setTempPassword(result.tempPassword);

          toast({
            title: "✅ Client créé et invitation envoyée",
            description: `Un email a été envoyé à ${formData.email}`,
          });

          // Ne pas fermer immédiatement pour montrer les infos
        } else {
          // Création simple sans compte
          await addClient(formData);
          toast({
            title: "✅ Client ajouté",
            description: "Le nouveau client a été créé sans compte.",
          });
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Une erreur s'est produite.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInvitationSent(false);
    setTempPassword('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: ''
    });
    onClose();
  };

  if (invitationSent) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>✅ Invitation envoyée!</DialogTitle>
            <DialogDescription>
              Le client a été créé et l'invitation a été envoyée par email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Un email a été envoyé à <strong>{formData.email}</strong> avec les instructions pour activer le compte.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Informations de connexion (pour vos archives):</p>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Mot de passe temporaire:</strong> <code className="bg-background px-2 py-1 rounded">{tempPassword}</code></p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ Le client devra changer ce mot de passe lors de sa première connexion
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Si le client ne reçoit pas l'email, vérifiez ses spams ou renvoyez l'invitation depuis la page Clients.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Modifier le client' : 'Ajouter un client'}
          </DialogTitle>
          <DialogDescription>
            {client ? 'Modifiez les informations du client' : 'Créez un nouveau client avec ou sans compte d\'accès'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du client *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Restaurant La Paix"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email {sendInvitation && '*'}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="client@exemple.com"
              required={sendInvitation}
              disabled={loading || !!client}
            />
            {sendInvitation && (
              <p className="text-xs text-muted-foreground mt-1">
                📧 Un email d'invitation sera envoyé à cette adresse
              </p>
            )}
            {client && (
              <p className="text-xs text-muted-foreground mt-1">
                L'email ne peut pas être modifié
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ex: 0612345678"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ex: 123 Rue Mohamed V, Casablanca"
              rows={3}
              disabled={loading}
            />
          </div>

          {!client && (
            <div className="flex items-start space-x-2 p-3 bg-muted rounded-lg">
              <Checkbox
                id="sendInvitation"
                checked={sendInvitation}
                onCheckedChange={(checked) => setSendInvitation(checked as boolean)}
                disabled={loading}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="sendInvitation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Créer un compte avec accès client
                </label>
                <p className="text-xs text-muted-foreground">
                  Le client recevra un email pour activer son compte
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {sendInvitation ? 'Création...' : 'En cours...'}
                </>
              ) : (
                <>
                  {sendInvitation && <Mail className="h-4 w-4 mr-2" />}
                  {client ? 'Modifier' : sendInvitation ? 'Créer et Inviter' : 'Créer'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
