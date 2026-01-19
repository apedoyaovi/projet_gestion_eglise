import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("UI Error Caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full space-y-6">
                        <div className="h-20 w-20 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                            <AlertOctagon className="h-10 w-10 text-red-600" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900">Quelque chose s'est mal passé</h2>
                            <p className="text-slate-500">
                                Une erreur inattendue est survenue dans l'interface. Ne vous inquiétez pas, vos données sont en sécurité.
                            </p>
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 py-6 text-lg"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Actualiser la page
                        </Button>

                        <p className="text-xs text-slate-400">
                            Si le problème persiste, veuillez contacter le support technique.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
