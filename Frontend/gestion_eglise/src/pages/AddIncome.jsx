import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const incomeSchema = z.object({
    date: z.string().min(1, "Date requise"),
    category: z.string().min(2, "Catégorie requise"),
    amount: z.string().min(1, "Montant requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Le montant doit être un nombre positif"
    }),
    account: z.enum(["Caisse", "Banque"]),
    description: z.string().optional(),
    reference: z.string().optional(),
});

export function AddIncome() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(incomeSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            account: "Caisse"
        }
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;

            if (!token) {
                alert("Session expirée. Veuillez vous reconnecter.");
                navigate('/login');
                return;
            }

            const payload = {
                ...data,
                amount: parseFloat(data.amount),
                type: 'INCOME',
                account: data.account.toUpperCase() // match backend enum
            };

            const response = await fetch('http://localhost:8080/api/transactions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                navigate('/finance');
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to save income:", errorData);
                alert("Erreur lors de l'enregistrement de la recette : " + (errorData.message || "Erreur serveur"));
            }
        } catch (error) {
            console.error("Error submitting income:", error);
            alert("Une erreur est survenue lors de l'envoi de la recette.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <Button variant="ghost" onClick={() => navigate('/finance')} className="pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la trésorerie
            </Button>

            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nouvelle Recette</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Enregistrer une entrée d'argent (Ressource)</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Détails de la recette</CardTitle>
                        <CardDescription>
                            Remplissez les informations de l'entrée d'argent
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                            {/* Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input id="date" type="date" {...register("date")} />
                                {errors.date && <span className="text-red-500 text-sm">{errors.date.message}</span>}
                            </div>

                            {/* Catégorie */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Catégorie *</Label>
                                <select
                                    id="category"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    {...register("category")}
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="Dîmes">Dîmes</option>
                                    <option value="Offrandes">Offrandes</option>
                                    <option value="Dons">Dons</option>
                                    <option value="Collectes spéciales">Collectes spéciales</option>
                                    <option value="Autres revenus">Autres revenus</option>
                                </select>
                                {errors.category && <span className="text-red-500 text-sm">{errors.category.message}</span>}
                            </div>

                            {/* Montant */}
                            <div className="space-y-2">
                                <Label htmlFor="amount">Montant (FCFA) *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Ex: 50000"
                                    {...register("amount")}
                                />
                                {errors.amount && <span className="text-red-500 text-sm">{errors.amount.message}</span>}
                            </div>

                            {/* Compte */}
                            <div className="space-y-2">
                                <Label htmlFor="account">Compte *</Label>
                                <select
                                    id="account"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    {...register("account")}
                                >
                                    <option value="Caisse">Caisse</option>
                                    <option value="Banque">Banque (FUCEC)</option>
                                </select>
                            </div>

                            {/* Référence */}
                            <div className="space-y-2">
                                <Label htmlFor="reference">Référence / N° Reçu</Label>
                                <Input id="reference" placeholder="Ex: REC-2026-001" {...register("reference")} />
                            </div>

                            {/* Description */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Description / Notes</Label>
                                <textarea
                                    id="description"
                                    rows="3"
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Informations complémentaires..."
                                    {...register("description")}
                                />
                            </div>

                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => navigate('/finance')} className="w-full sm:w-auto">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer la recette'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
