import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Calendar,
    MapPin,
    Filter,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const EVENT_TYPES = ['Tous', 'Culte', 'Sortie', 'Semaine Spéciale', 'Formation', 'Conférence', 'Jeûne et Prière', 'Évangélisation'];

export function PublicEventsList() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('Tous');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/public/events');
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'Tous' || event.type === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/')} className="rounded-full h-10 w-10 p-0 hover:bg-slate-100">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 leading-tight">Archives des Événements</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredEvents.length} événements trouvés</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search and Filters */}
                <div className="mb-10 space-y-6">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par titre ou lieu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-blue-500 focus:ring-0 transition-all font-medium text-slate-700 shadow-sm"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {EVENT_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${selectedType === type
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                        <p className="font-bold text-slate-400">Chargement des archives...</p>
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event) => (
                            <Card key={event.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white">
                                <div className="relative h-60 overflow-hidden">
                                    <img
                                        src={(event.images && event.images.length > 0) ? event.images[0] : "https://images.unsplash.com/photo-1548484352-ea1b3e8d2a74?q=80&w=2070&auto=format&fit=crop"}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-white/95 text-slate-900 border-none px-4 py-1.5 rounded-xl font-black text-[10px] uppercase shadow-xl backdrop-blur-md">
                                            {event.type}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-3 text-xs font-bold text-blue-600 mb-3">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center text-slate-400 font-bold text-xs uppercase tracking-tight">
                                            <MapPin className="h-4 w-4 mr-2 text-slate-300" />
                                            {event.location}
                                        </div>
                                        <Button
                                            onClick={() => navigate(`/archives/${event.id}`)}
                                            variant="ghost"
                                            className="h-10 w-10 rounded-full p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 group/btn"
                                        >
                                            <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 font-bold text-xl mb-2">Aucun événement ne correspond à votre recherche</p>
                        <p className="text-slate-300">Essayez de modifier vos filtres ou termes de recherche</p>
                    </div>
                )}
            </div>
        </div>
    );
}
