import { useLocation, Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="text-center animate-fade-in">
        <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page non trouvée</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          La page <code className="px-2 py-1 bg-muted rounded text-sm">{location.pathname}</code> n'existe pas.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button asChild className="btn-gradient-primary">
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
