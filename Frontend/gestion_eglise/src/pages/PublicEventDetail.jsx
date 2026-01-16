import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    MapPin,
    Clock,
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

export function PublicEventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/public/events/${id}`);
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
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 bg-white min-h-screen space-y-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-muted-foreground text-lg">Récupération des détails de l'événement...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-white p-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
                <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100 mt-8">
                    <p className="text-red-500 font-medium text-lg">Événement non trouvé.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="group pl-0 hover:pl-2 transition-all font-semibold text-slate-600">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Retour
                    </Button>
                    <span className="ml-4 font-bold text-slate-900 border-l pl-4 truncate">
                        {event.title}
                    </span>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Hero & Info */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Hero Section */}
                        <div className="relative h-[25rem] md:h-[32rem] rounded-[2rem] overflow-hidden shadow-2xl bg-slate-200 ring-1 ring-slate-200">
                            <img
                                src={(event.images && event.images.length > 0) ? event.images[0] : getEventImage(event.type)}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                            <div className="absolute bottom-10 left-10 right-10 text-white">
                                <Badge className="mb-4 bg-blue-600 border-none px-4 py-1.5 font-bold uppercase tracking-wider">
                                    {event.type}
                                </Badge>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-xl leading-tight">
                                    {event.title}
                                </h1>
                                <div className="flex flex-wrap gap-6 text-base md:text-lg font-bold">
                                    <span className="flex items-center gap-2.5 bg-white/20 backdrop-blur-xl px-5 py-2.5 rounded-2xl ring-1 ring-white/30">
                                        <CalendarIcon className="h-5 w-5" />
                                        {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    {event.time && (
                                        <span className="flex items-center gap-2.5 bg-white/20 backdrop-blur-xl px-5 py-2.5 rounded-2xl ring-1 ring-white/30">
                                            <Clock className="h-5 w-5" />
                                            {event.time.substring(0, 5)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
                                <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Localisation</p>
                                    <p className="font-extrabold text-slate-900 text-lg">{event.location}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
                                <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                                    <CalendarIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Catégorie</p>
                                    <p className="font-extrabold text-slate-900 text-lg">{event.type}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <section>
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900">
                                <span className="h-8 w-1.5 bg-blue-600 rounded-full" />
                                Description & Programme
                            </h2>
                            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 leading-relaxed text-blue-950 font-medium">
                                <div className="prose prose-blue max-w-none text-xl">
                                    {event.description || "Aucune description détaillée n'est disponible pour cet événement."}
                                </div>
                            </div>
                        </section>

                        {/* Gallery Section */}
                        {event.images && event.images.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900">
                                    <span className="h-8 w-1.5 bg-blue-600 rounded-full" />
                                    Galerie Photos
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {event.images.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-3xl overflow-hidden shadow-lg group border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer">
                                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8">
                        {/* Highlights Card */}
                        <Card className="rounded-[2.5rem] shadow-xl border-none bg-slate-900 text-white overflow-hidden p-8">
                            <h3 className="text-[10px] text-blue-400 uppercase tracking-widest font-black mb-6">À retenir</h3>
                            <ul className="space-y-6">
                                <li className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        <CalendarIcon className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Date</p>
                                        <p className="font-bold">{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Lieu</p>
                                        <p className="font-bold">{event.location}</p>
                                    </div>
                                </li>
                                {event.organizer && (
                                    <li className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <Badge className="bg-blue-500 rounded-full p-0 h-5 w-5 border-none"></Badge>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Organisateur</p>
                                            <p className="font-bold">{event.organizer}</p>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
