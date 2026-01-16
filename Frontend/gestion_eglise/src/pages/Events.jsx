import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Image as ImageIcon, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function Events() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:8080/api/events', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setEvents(data);
                } else {
                    console.error("Failed to fetch events");
                }
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [navigate]);

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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-muted-foreground text-lg">Chargement des événements...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Événements & Activités</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Planning des activités et archives photos.</p>
                </div>
                <Button onClick={() => navigate('/events/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvel Événement
                </Button>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed">
                    <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">Aucun événement planifié</h3>
                    <p className="text-slate-500 mb-6">Commencez par créer votre premier événement.</p>
                    <Button onClick={() => navigate('/events/new')} variant="outline">
                        Créer un événement
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow group border-none shadow-sm">
                            <div className="h-48 bg-slate-100 relative group-hover:brightness-90 transition-all overflow-hidden">
                                <img
                                    src={(event.images && event.images.length > 0) ? event.images[0] : getEventImage(event.type)}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{event.type}</span>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{event.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm text-slate-600">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                                            <CalendarIcon className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <span className="font-medium">{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <span className="font-medium">{event.location}</span>
                                    </div>
                                    <p className="pt-2 line-clamp-2 text-slate-500 italic">{event.description}</p>
                                </div>
                                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">{event.photoCount || 0} photos archivées</span>
                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/events/${event.id}`)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                        Voir détails
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
