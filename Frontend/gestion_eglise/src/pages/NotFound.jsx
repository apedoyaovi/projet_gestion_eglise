import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="space-y-6 max-w-md">
                <div className="relative">
                    <div className="h-32 w-32 bg-blue-100 rounded-full mx-auto flex items-center justify-center animate-pulse">
                        <AlertTriangle className="h-16 w-16 text-blue-600" />
                    </div>
                </div>

                <h1 className="text-6xl font-black text-slate-900">404</h1>
                <h2 className="text-2xl font-bold text-slate-800">Page Introuvable</h2>
                <p className="text-slate-500 text-lg">
                    Oups ! La page que vous recherchez semble avoir disparu ou l'adresse est incorrecte.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                    <Button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Accueil
                    </Button>
                </div>
            </div>

            <div className="mt-12 text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} GestionÉglise. Tous droits réservés.
            </div>
        </div>
    );
}
