import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export function EditMember() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(memberSchema),
    });

    const maritalStatus = watch("maritalStatus");

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`http://localhost:8080/api/members/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Map backend fields to frontend Zod schema
                    reset({
                        ...data,
                        firstname: data.firstName || data.firstname,
                        lastname: data.lastName || data.lastname,
                        phone: data.phoneNumber || data.phone,
                        dob: data.birthDate || data.dob,
                        group: data.memberGroup || data.group,
                    });
                } else {
                    console.error("Failed to fetch member");
                }
            } catch (error) {
                console.error("Error fetching member:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMember();
    }, [id, navigate, reset]);

    const handleGenerateMatricule = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9000) + 1000;
        const generated = `${year}-${random}`;
        setValue('matricule', generated);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;

            if (!token) {
                navigate('/login');
                return;
            }

            const payload = {
                ...data,
                firstName: data.firstname,
                lastName: data.lastname,
                phoneNumber: data.phone,
                birthDate: data.dob,
                memberGroup: data.group,
                // Ensure dates are mapped or null
                marriageDate: data.marriageDate || null,
                arrivalDate: data.arrivalDate || null,
                baptismDate: data.baptismDate || null,
                departureDate: data.departureDate || null,
            };

            const response = await fetch(`http://localhost:8080/api/members/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                navigate(`/members/${id}`);
            } else {
                const errorData = await response.json();
                alert("Erreur lors de la mise à jour: " + (errorData.message || "Erreur inconnue"));
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Une erreur est survenue lors de la mise à jour.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <p className="text-muted-foreground text-lg">Chargement des informations...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <Button variant="ghost" onClick={() => navigate(`/members/${id}`)} className="pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux détails
            </Button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Modifier le Membre</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Mettre à jour les informations du membre.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Informations Personnelles</CardTitle>
                        <CardDescription>
                            Modifiez les champs ci-dessous pour mettre à jour le profil.
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
                                    >
                                        <Wand2 className="h-4 w-4" />
                                    </Button>
                                </div>
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
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
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
                                <Input id="profession" placeholder="Ex: Enseignant..." {...register("profession")} />
                            </div>

                            {/* Téléphone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone *</Label>
                                <Input id="phone" {...register("phone")} />
                                {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register("email")} />
                            </div>

                            {/* Statut */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Statut *</Label>
                                <select id="status" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("status")}>
                                    <option value="Actif">Actif</option>
                                    <option value="Nouveau">Nouveau</option>
                                    <option value="Inactif">Inactif</option>
                                </select>
                            </div>

                            {/* Statut Matrimonial */}
                            <div className="space-y-2">
                                <Label htmlFor="maritalStatus">Statut Matrimonial *</Label>
                                <select id="maritalStatus" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("maritalStatus")}>
                                    <option value="Célibataire">Célibataire</option>
                                    <option value="Marié(e)">Marié(e)</option>
                                    <option value="Veuf/Veuve">Veuf/Veuve</option>
                                    <option value="Divorcé(e)">Divorcé(e)</option>
                                </select>
                            </div>

                            {maritalStatus === "Marié(e)" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="marriageDate">Date de Mariage</Label>
                                        <Input id="marriageDate" type="date" {...register("marriageDate")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="marriagePlace">Lieu de Mariage</Label>
                                        <Input id="marriagePlace" {...register("marriagePlace")} />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Adresse</Label>
                                <Input id="address" {...register("address")} />
                            </div>

                            {/* Section Vie Spirituelle */}
                            <div className="md:col-span-2 border-t pt-4 mt-4">
                                <h3 className="text-sm font-medium mb-4 uppercase text-gray-400 tracking-wider">Vie Spirituelle & Église</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="arrivalDate">Date d'arrivée</Label>
                                        <Input id="arrivalDate" type="date" {...register("arrivalDate")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="baptismDate">Date de Baptême</Label>
                                        <Input id="baptismDate" type="date" {...register("baptismDate")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="baptismLocation">Lieu de Baptême</Label>
                                        <Input id="baptismLocation" {...register("baptismLocation")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="group">Groupe / Département</Label>
                                        <select id="group" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" {...register("group")}>
                                            <option value="">Aucun</option>
                                            <option value="Chorale">Chorale</option>
                                            <option value="Jeunesse">Jeunesse</option>
                                            <option value="Femmes">Groupe des Femmes</option>
                                            <option value="Hommes">Groupe des Hommes</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departureDate">Date de départ</Label>
                                        <Input id="departureDate" type="date" {...register("departureDate")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="departureReason">Motif de départ</Label>
                                        <Input id="departureReason" {...register("departureReason")} />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                            <Button type="button" variant="outline" onClick={() => navigate(`/members/${id}`)} className="w-full sm:w-auto">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Mise à jour...' : 'Enregistrer les modifications'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
