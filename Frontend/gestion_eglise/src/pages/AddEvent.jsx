import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Calendar as CalendarIcon, Camera, X } from 'lucide-react';
import { API_URLS } from '@/lib/api.jsBase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const eventSchema = z.object({
    title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
    date: z.string().min(1, "Date requise"),
    time: z.string().optional(),
    type: z.string().min(2, "Type d'événement requis"),
    location: z.string().min(2, "Lieu requis"),
    description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
    organizer: z.string().optional(),
    maxParticipants: z.string().optional(),
    budget: z.string().optional(),
    photos: z.any().optional(),
});

export function AddEvent() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previews, setPreviews] = useState([]);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            time: "10:00"
        }
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setValue("photos", files);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removePreview = (index) => {
        setPreviews(prev => prev.filter((_, i) => i !== index));
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

            // Convert all images to Base64
            const imagePromises = Array.from(data.photos || []).map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            });
            const imagesBase64 = await Promise.all(imagePromises);

            // Prepare data for backend
            const eventData = {
                title: data.title,
                date: data.date,
                time: data.time ? `${data.time}:00` : null,
                type: data.type,
                location: data.location,
                description: data.description,
                organizer: data.organizer,
                maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
                budget: data.budget ? parseFloat(data.budget) : null,
                images: imagesBase64,
                photoCount: previews.length
            };

            const response = await fetch(API_URLS.EVENT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                navigate('/events');
            } else if (response.status === 413) {
                alert("Les images sont trop lourdes. Veuillez réduire leur taille ou en sélectionner moins.");
            } else {
                console.error("Failed to create event");
                alert("Erreur lors de la création de l'événement.");
            }
        } catch (error) {
            console.error("Error creating event:", error);
            alert("Une erreur est survenue lors de la connexion au serveur.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <Button variant="ghost" onClick={() => navigate('/events')} className="pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux événements
            </Button>

            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nouvel Événement</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Planifier une nouvelle activité ou événement</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Détails de l'événement</CardTitle>
                        <CardDescription>
                            Remplissez les informations de l'activité à planifier
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                            {/* Titre */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="title">Titre de l'événement *</Label>
                                <Input id="title" placeholder="Ex: Culte Spécial de Noël" {...register("title")} />
                                {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Type d'événement *</Label>
                                <select
                                    id="type"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    {...register("type")}
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="Culte">Culte</option>
                                    <option value="Sortie">Sortie</option>
                                    <option value="Semaine Spéciale">Semaine Spéciale</option>
                                    <option value="Formation">Formation</option>
                                    <option value="Conférence">Conférence</option>
                                    <option value="Jeûne et Prière">Jeûne et Prière</option>
                                    <option value="Évangélisation">Évangélisation</option>
                                    <option value="Autre">Autre</option>
                                </select>
                                {errors.type && <span className="text-red-500 text-sm">{errors.type.message}</span>}
                            </div>

                            {/* Lieu */}
                            <div className="space-y-2">
                                <Label htmlFor="location">Lieu *</Label>
                                <Input id="location" placeholder="Ex: Grand Temple, Parc National..." {...register("location")} />
                                {errors.location && <span className="text-red-500 text-sm">{errors.location.message}</span>}
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input id="date" type="date" {...register("date")} />
                                {errors.date && <span className="text-red-500 text-sm">{errors.date.message}</span>}
                            </div>

                            {/* Heure */}
                            <div className="space-y-2">
                                <Label htmlFor="time">Heure</Label>
                                <Input id="time" type="time" {...register("time")} />
                            </div>

                            {/* Organisateur */}
                            <div className="space-y-2">
                                <Label htmlFor="organizer">Organisateur / Responsable</Label>
                                <Input id="organizer" placeholder="Ex: Pasteur, Département Jeunesse..." {...register("organizer")} />
                            </div>

                            {/* Nombre de participants */}
                            <div className="space-y-2">
                                <Label htmlFor="maxParticipants">Nombre de participants attendus</Label>
                                <Input id="maxParticipants" type="number" placeholder="Ex: 100" {...register("maxParticipants")} />
                            </div>

                            {/* Budget */}
                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget estimé (FCFA)</Label>
                                <Input id="budget" type="number" placeholder="Ex: 50000" {...register("budget")} />
                            </div>

                            {/* Description */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Description / Programme *</Label>
                                <textarea
                                    id="description"
                                    rows="5"
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Décrivez le déroulement de l'événement, les activités prévues..."
                                    {...register("description")}
                                />
                                {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
                            </div>

                            {/* Photos Section */}
                            <div className="space-y-4 md:col-span-2 border-t pt-4 mt-2">
                                <Label className="text-base">Photos & Médias</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {previews.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
                                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removePreview(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                                        <Camera className="h-6 w-6 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-2">Ajouter</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground italic">Formats acceptés : JPG, PNG. Max 5MB par image.</p>
                            </div>

                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => navigate('/events')} className="w-full sm:w-auto">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Enregistrement...' : 'Créer l\'événement'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
