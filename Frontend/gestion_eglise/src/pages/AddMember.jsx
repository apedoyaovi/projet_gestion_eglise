import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const memberSchema = z.object({
    matricule: z.string().optional(),
    firstname: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastname: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide").optional().or(z.literal('')),
    phone: z.string().min(8, "Numéro de téléphone invalide"),
    dob: z.string().min(1, "Date de naissance requise"),
    gender: z.enum(["Homme", "Femme"]),
    profession: z.string().optional(),
    address: z.string().optional(),
    maritalStatus: z.string().min(1, "Statut matrimonial requis"),
    marriageDate: z.string().optional(),
    marriagePlace: z.string().optional(),
    arrivalDate: z.string().optional(),
    baptismDate: z.string().optional(),
    baptismLocation: z.string().optional(),
    departureDate: z.string().optional(),
    departureReason: z.string().optional(),
    group: z.string().optional(),
    status: z.string().min(1, "Statut requis"),
});

export function AddMember() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            gender: "Homme",
            status: "Actif",
            maritalStatus: "Célibataire"
        }
    });

    const maritalStatus = watch("maritalStatus");

    const handleGenerateMatricule = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9000) + 1000; // 4 digits
        const generated = `${year}-${random}`;
        setValue('matricule', generated);
    };

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

            // Map "group" to "memberGroup" to match backend
            const payload = {
                ...data,
                memberGroup: data.group,
                // Handle empty dates as null for backend compatibility
                dob: data.dob || null,
                birthDate: data.dob || null, // Backend uses birthDate
                marriageDate: data.marriageDate || null,
                arrivalDate: data.arrivalDate || null,
                baptismDate: data.baptismDate || null,
                departureDate: data.departureDate || null,
                firstName: data.firstname,
                lastName: data.lastname,
                phoneNumber: data.phone,
                baptismLocation: data.baptismLocation || data.baptismPlace, // Check both
            };

            const response = await fetch('http://localhost:8080/api/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                navigate('/members');
            } else {
                const errorData = await response.json();
                alert("Erreur lors de l'enregistrement: " + (errorData.message || "Erreur inconnue"));
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <Button variant="ghost" onClick={() => navigate('/members')} className="pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
            </Button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nouveau Membre</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Ajouter un nouveau fidèle à la base de données.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Informations Personnelles</CardTitle>
                        <CardDescription>
                            Remplissez les informations pour inscrire un nouveau membre.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                            {/* Matricule */}
                            <div className="space-y-2">
                                <Label htmlFor="matricule">Matricule (Optionnel)</Label>
                                <div className="flex gap-2">
                                    <Input id="matricule" placeholder="Ex: 2024-0001" {...register("matricule")} className="flex-1" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleGenerateMatricule}
                                        title="Générer automatiquement"
                                    >
                                        <Wand2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Cliquez sur la baguette pour générer un matricule</p>
                            </div>

                            {/* Nom */}
                            <div className="space-y-2">
                                <Label htmlFor="lastname">Nom *</Label>
                                <Input id="lastname" placeholder="Ex: DUPONT" {...register("lastname")} />
                                {errors.lastname && <span className="text-red-500 text-sm">{errors.lastname.message}</span>}
                            </div>

                            {/* Prénom */}
                            <div className="space-y-2">
                                <Label htmlFor="firstname">Prénom *</Label>
                                <Input id="firstname" placeholder="Ex: Jean" {...register("firstname")} />
                                {errors.firstname && <span className="text-red-500 text-sm">{errors.firstname.message}</span>}
                            </div>

                            {/* Genre */}
                            <div className="space-y-2">
                                <Label htmlFor="gender">Genre *</Label>
                                <select
                                    id="gender"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    {...register("gender")}
                                >
                                    <option value="Homme">Homme</option>
                                    <option value="Femme">Femme</option>
                                </select>
                            </div>

                            {/* Date de Naissance */}
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date de Naissance *</Label>
                                <Input id="dob" type="date" {...register("dob")} />
                                {errors.dob && <span className="text-red-500 text-sm">{errors.dob.message}</span>}
                            </div>

                            {/* Profession */}
                            <div className="space-y-2">
                                <Label htmlFor="profession">Profession</Label>
                                <Input id="profession" placeholder="Ex: Enseignant, Commerçant..." {...register("profession")} />
                            </div>

                            {/* Téléphone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone *</Label>
                                <Input id="phone" placeholder="90 00 00 00" {...register("phone")} />
                                {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Optionnel)</Label>
                                <Input id="email" type="email" placeholder="jean@example.com" {...register("email")} />
                                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                            </div>

                            {/* Adresse */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Adresse de résidence</Label>
                                <Input id="address" placeholder="Quartier, Rue..." {...register("address")} />
                            </div>

                            {/* Statut */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Statut *</Label>
                                <select
                                    id="status"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    {...register("status")}
                                >
                                    <option value="Actif">Actif</option>
                                    <option value="Nouveau">Nouveau</option>
                                    <option value="Inactif">Inactif</option>
                                </select>
                                {errors.status && <span className="text-red-500 text-sm">{errors.status.message}</span>}
                            </div>

                            {/* Statut Matrimonial */}
                            <div className="space-y-2">
                                <Label htmlFor="maritalStatus">Statut Matrimonial *</Label>
                                <select
                                    id="maritalStatus"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    {...register("maritalStatus")}
                                >
                                    <option value="Célibataire">Célibataire</option>
                                    <option value="Marié(e)">Marié(e)</option>
                                    <option value="Veuf/Veuve">Veuf/Veuve</option>
                                    <option value="Divorcé(e)">Divorcé(e)</option>
                                </select>
                                {errors.maritalStatus && <span className="text-red-500 text-sm">{errors.maritalStatus.message}</span>}
                            </div>

                            {maritalStatus === "Marié(e)" && (
                                <>
                                    {/* Date de Mariage */}
                                    <div className="space-y-2">
                                        <Label htmlFor="marriageDate">Date de Mariage</Label>
                                        <Input id="marriageDate" type="date" {...register("marriageDate")} />
                                    </div>

                                    {/* Lieu de Mariage */}
                                    <div className="space-y-2">
                                        <Label htmlFor="marriagePlace">Lieu de Mariage</Label>
                                        <Input id="marriagePlace" placeholder="Ex: Mairie de Lomé" {...register("marriagePlace")} />
                                    </div>
                                </>
                            )}

                            {/* Section Vie Spirituelle */}
                            <div className="md:col-span-2 border-t pt-4 mt-4">
                                <h3 className="text-sm font-medium mb-4">Vie Spirituelle & Église</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                                    {/* Date d'arrivée */}
                                    <div className="space-y-2">
                                        <Label htmlFor="arrivalDate">Date d'arrivée à l'église</Label>
                                        <Input id="arrivalDate" type="date" {...register("arrivalDate")} />
                                    </div>

                                    {/* Date de Baptême */}
                                    <div className="space-y-2">
                                        <Label htmlFor="baptismDate">Date de Baptême</Label>
                                        <Input id="baptismDate" type="date" {...register("baptismDate")} />
                                    </div>

                                    {/* Lieu de Baptême */}
                                    <div className="space-y-2">
                                        <Label htmlFor="baptismLocation">Lieu de Baptême</Label>
                                        <Input id="baptismLocation" placeholder="Ex: Temple Principal, Rivière..." {...register("baptismLocation")} />
                                    </div>

                                    {/* Groupe */}
                                    <div className="space-y-2">
                                        <Label htmlFor="group">Groupe / Département</Label>
                                        <select
                                            id="group"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            {...register("group")}
                                        >
                                            <option value="">Sélectionner...</option>
                                            <option value="Chorale">Chorale</option>
                                            <option value="Jeunesse">Jeunesse</option>
                                            <option value="Femmes">Groupe des Femmes</option>
                                            <option value="Hommes">Groupe des Hommes</option>
                                            <option value="Enfants">École du Dimanche (Enfants)</option>
                                            <option value="Intercession">Intercession</option>
                                            <option value="Évangélisation">Évangélisation</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>

                                    {/* Date de Départ */}
                                    <div className="space-y-2">
                                        <Label htmlFor="departureDate">Date de départ (si applicable)</Label>
                                        <Input id="departureDate" type="date" {...register("departureDate")} />
                                    </div>

                                    {/* Motif de Départ */}
                                    <div className="space-y-2">
                                        <Label htmlFor="departureReason">Motif de départ</Label>
                                        <Input id="departureReason" placeholder="Ex: Déménagement, Mutation..." {...register("departureReason")} />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                            <Button type="button" variant="outline" onClick={() => navigate('/members')} className="w-full sm:w-auto">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Membre'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
