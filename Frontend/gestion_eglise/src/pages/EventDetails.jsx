import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Edit,
    Trash2,
    Info,
    MapPin,
    Clock,
    ChevronRight,
    Camera,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const getEventImage = (type) => {
    const images = {
        'Culte': 'https://images.unsplash.com/photo-1438232992991-995b7058df3e?q=80&w=2073&auto=format&fit=crop',
        'Sortie': 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop',
        'Semaine Spéciale': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop',
        'Formation': 'https://images.unsplash.com/photo-1524178232363-1fb280714553?q=80&w=2070&auto=format&fit=crop',
        'Conférence': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070&auto=format&fit=crop',
        'Jeûne et Prière': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop',
        'Évangélisation': 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=2070&auto=format&fit=crop'
    };
    return images[type] || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop';
};

export function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`http://localhost:8080/api/events/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setEvent(data);
                } else {
                    console.error("Failed to fetch event details");
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            if (response.ok) {
                navigate('/events');
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Une erreur est survenue.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-muted-foreground text-lg">Récupération des détails de l'événement...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="space-y-4 p-8">
                <Button variant="ghost" onClick={() => navigate('/events')} className="pl-0">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux événements
                </Button>
                <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-red-500 font-medium text-lg">Événement non trouvé ou supprimé.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header / Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Button variant="ghost" onClick={() => navigate('/events')} className="group pl-0 hover:pl-2 transition-all w-fit font-semibold text-slate-600">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Retour aux événements
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/events/${id}/edit`)} className="hover:bg-blue-50 hover:text-blue-600 border-blue-200 font-bold transition-all">
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-white hover:bg-red-600 border-red-100 font-bold transition-all">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                    </Button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Hero & Info */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Hero Section */}
                    <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-xl bg-slate-200">
                        <img
                            src={(event.images && event.images.length > 0) ? event.images[0] : getEventImage(event.type)}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 text-white text-wrap">
                            <Badge className="mb-3 bg-blue-600 hover:bg-blue-700 pointer-events-none border-none px-3 py-1 font-bold">
                                {event.type}
                            </Badge>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 drop-shadow-xl">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm md:text-base font-bold opacity-90">
                                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
                                    <CalendarIcon className="h-4 w-4" />
                                    {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                {event.time && (
                                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
                                        <Clock className="h-4 w-4" />
                                        {event.time.substring(0, 5)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Localisation</p>
                            <div className="flex items-center text-blue-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <p className="font-bold">{event.location}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Participants</p>
                            <p className="font-bold text-slate-800">{event.maxParticipants || 'Illimité'}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Budget Prévu</p>
                            <p className="font-black text-emerald-600">{event.budget ? `${event.budget.toLocaleString('fr-FR')} FCFA` : 'N/A'}</p>
                        </div>
                    </div>

                    {/* About Section */}
                    <section>
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-2 text-slate-800">
                            <div className="h-8 w-1 bg-blue-600 rounded-full" />
                            Description & Programme
                        </h2>
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 leading-relaxed text-lg text-slate-600">
                            {event.description || "Aucune description fournie pour cet événement."}
                        </div>
                    </section>

                    {/* Gallery Section */}
                    {event.photoCount > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800">
                                    <div className="h-8 w-1 bg-blue-600 rounded-full" />
                                    Galerie Photos
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {event.images && event.images.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-md group border-2 border-transparent hover:border-blue-500 transition-all">
                                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                ))}
                                {(!event.images || event.images.length === 0) && (
                                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <Camera className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium font-bold">Aucune photo dans la galerie</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">

                    {/* Organizer Card */}
                    <Card className="rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                        <div className="h-2 bg-blue-600 w-full" />
                        <CardHeader className="pb-2 px-6 pt-6">
                            <CardTitle className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Responsable</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl">
                                    {event.organizer ? event.organizer.charAt(0) : '?'}
                                </div>
                                <div>
                                    <p className="font-extrabold text-lg leading-tight text-slate-900">{event.organizer || 'Non spécifié'}</p>
                                    <p className="text-xs font-bold text-blue-600 mt-0.5">Organisateur</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
