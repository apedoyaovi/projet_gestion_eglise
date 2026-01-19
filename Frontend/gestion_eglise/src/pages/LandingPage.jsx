import { useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight, Menu, X, LogIn, MapPin, Clock, Mail, Phone, MapPin as MapPinIcon, UserCheck, LockIcon, Lock} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function LandingPage() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({ totalMembers: 0, totalEvents: 0 });
    const [latestEvents, setLatestEvents] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [churchInfo, setChurchInfo] = useState({
        churchName: 'TEMPLE EMMANUEL',
        address: 'Lomé, Togo',
        phone: '+228 XX XX XX XX',
        email: 'contact@temple-emmanuel.org'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        message: ''
    });

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const [statsRes, eventsRes, schedulesRes, churchRes] = await Promise.all([
                    fetch('http://localhost:8080/api/public/stats'),
                    fetch('http://localhost:8080/api/public/events/latest'),
                    fetch('http://localhost:8080/api/public/schedules'),
                    fetch('http://localhost:8080/api/public/church-info')
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (eventsRes.ok) setLatestEvents(await eventsRes.json());
                if (schedulesRes.ok) setSchedules(await schedulesRes.json());
                if (churchRes.ok) setChurchInfo(await churchRes.json());

            } catch (error) {
                console.error("Home page fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPublicData();
    }, []);

    const handleContactChange = (e) => {
        setContactForm({
            ...contactForm,
            [e.target.name]: e.target.value
        });
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        console.log('Formulaire envoyé:', contactForm);
        alert('Merci pour votre message ! Nous vous répondrons rapidement.');
        setContactForm({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-lg flex items-center justify-center shadow">
                                <span className="text-white font-bold text-lg">TE</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl text-slate-900 tracking-tight leading-tight uppercase">{churchInfo.churchName}</span>
                                <span className="text-xs text-slate-500">Église baptiste</span>
                            </div>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#home" className="text-slate-700 hover:text-blue-700 font-medium transition-colors text-sm">Accueil</a>
                            <a href="#about" className="text-slate-700 hover:text-blue-700 font-medium transition-colors text-sm">À propos</a>
                            <a href="#events" className="text-slate-700 hover:text-blue-700 font-medium transition-colors text-sm">Archives</a>
                            <a href="#contact" className="text-slate-700 hover:text-blue-700 font-medium transition-colors text-sm">Contact</a>
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-full px-6 py-3 text-sm shadow hover:shadow-md transition-all"
                            >
                              <LockIcon className="mr-1.5 h-3.5 w-3.5"/> Connexion
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-slate-700 hover:text-blue-700 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 absolute w-full shadow-lg">
                        <div className="px-4 pt-3 pb-5 space-y-1">
                            <a href="#home" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">Accueil</a>
                            <a href="#about" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">À propos</a>
                            <a href="#events" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">Archives</a>
                            <a href="#contact" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">Contact</a>
                            <div className="pt-5 mt-4 border-t border-gray-100">
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full justify-center py-5 text-sm bg-gradient-to-r from-blue-700 to-indigo-700"
                                >
                                    <LogIn className="mr-2 h-4 w-4" /> Connexion Admin
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative pt-28 pb-16 lg:pt-36 lg:pb-20 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5" style={{ maskImage: 'linear-gradient(to left, black, transparent)' }} />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center">
                        <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-semibold">
                            Bienvenue à la maison de Dieu
                        </Badge>
                        <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
                            {churchInfo.churchName}
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 italic">"Dieu avec nous"</span>
                        </h1>
                        <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-md mx-auto">
                            Une communauté chrétienne engagée dans la foi et le service.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button size="default" className="rounded-full px-6 text-sm h-11 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 shadow">
                                <a href="#contact">Horaire des cultes</a>
                            </Button>
                            <Button size="default" variant="outline" className="rounded-full px-6 text-sm h-11 border border-blue-200 hover:border-blue-300 text-blue-700">
                                <a href="#contact">Nous Contacter</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Presentation Section */}
            <section id="about" className="py-16 bg-gradient-to-b from-white to-blue-50/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl h-[400px] border-4 border-white">
                            <img
                                src="https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=2080&auto=format&fit=crop"
                                alt="Communauté"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                                <p className="font-bold text-xl mb-1">Une famille dans la foi</p>
                                <p className="text-sm opacity-90">Servir Dieu et notre prochain</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Notre Histoire & Mission</h2>
                            <div className="space-y-4 text-base text-slate-600 leading-relaxed">
                                <p>
                                    Le {churchInfo.churchName} est une communauté protestante évangélique établie au cœur de la ville.
                                </p>
                                <p>
                                    Notre mission est de partager l'amour de Dieu et de témoigner de Sa grâce à travers nos actions quotidiennes.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="p-4 bg-white rounded-xl border border-blue-100">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent mb-1">{stats.totalMembers}+</div>
                                    <div className="text-xs font-semibold text-slate-700">Membres Actifs</div>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-blue-100">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent mb-1">{stats.totalEvents}+</div>
                                    <div className="text-xs font-semibold text-slate-700">Événements</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Past Events Section */}
            <section id="events" className="py-16 bg-gradient-to-b from-blue-50/30 to-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <span className="text-blue-700 font-bold tracking-wider uppercase text-xs mb-2 block">Mémoire</span>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Archives des Événements</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {latestEvents.length > 0 ? latestEvents.map((event) => (
                            <div key={event.id} className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 border border-blue-100">
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                                    <img
                                        src={(event.images && event.images.length > 0) ? event.images[0] : "https://images.unsplash.com/photo-1548484352-ea1b3e8d2a74?q=80&w=2070&auto=format&fit=crop"}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow z-20">
                                        {event.type}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center text-xs text-slate-500 mb-3 space-x-3">
                                        <div className="flex items-center">
                                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                            {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                        <div className="flex items-center text-slate-600 text-xs">
                                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                            {event.location}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => navigate(`/archives/${event.id}`)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-1 text-xs h-7"
                                        >
                                            Détail
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-blue-50/50 rounded-3xl border border-dashed border-blue-100">
                                <p className="text-slate-400 font-medium">Aucun événement récent à afficher.</p>
                            </div>
                        )}
                    </div>

                    {latestEvents.length > 0 && (
                        <div className="text-center mt-10">
                            <Button
                                onClick={() => navigate('/archives')}
                                variant="outline"
                                className="rounded-full px-8 py-6 text-base border-2 border-blue-600 text-blue-700 hover:bg-blue-50"
                            >
                                Voir tous les événements
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-16 bg-white border-t border-blue-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <span className="text-blue-700 font-bold tracking-wider uppercase text-xs mb-2 block">Contact</span>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Prenez contact</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-4 text-sm">Coordonnées</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Adresse</p>
                                            <p className="text-xs text-slate-600">{churchInfo.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Téléphone</p>
                                            <p className="text-xs text-slate-600">{churchInfo.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Email</p>
                                            <p className="text-xs text-slate-600">{churchInfo.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-4 text-sm">Horaires des cultes</h3>
                                <ul className="space-y-2 text-sm">
                                    {schedules.length > 0 ? schedules.map((s) => (
                                        <li key={s.id} className="flex justify-between border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                                            <div className="flex flex-col">
                                                <span className="text-slate-600 font-medium">{s.dayOfWeek}</span>
                                                <span className="text-[10px] text-blue-600 font-bold uppercase">{s.label}</span>
                                            </div>
                                            <span className="font-bold text-slate-900">{s.time}</span>
                                        </li>
                                    )) : (
                                        <div className="py-4 text-center">
                                            <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-xs text-slate-400 italic">Aucun horaire défini</p>
                                        </div>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleContactSubmit} className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 mb-1.5">Nom complet</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={contactForm.name}
                                                onChange={handleContactChange}
                                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                                placeholder="Votre nom"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={contactForm.email}
                                                onChange={handleContactChange}
                                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                                placeholder="votre@email.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 mb-1.5">Message</label>
                                        <textarea
                                            name="message"
                                            value={contactForm.message}
                                            onChange={handleContactChange}
                                            rows="4"
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                            placeholder="Votre message..."
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5">
                                        Envoyer le message
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">TE</span>
                                </div>
                                <span className="font-bold text-lg text-white uppercase">{churchInfo.churchName}</span>
                            </div>
                            <p className="text-xs text-slate-400">Une communauté de foi et d'amour.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-white text-sm mb-4">L'église</h4>
                            <ul className="space-y-2 text-xs">
                                <li>{churchInfo.address}</li>
                                <li>{churchInfo.phone}</li>
                                <li>{churchInfo.email}</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white text-sm mb-4">Liens</h4>
                            <ul className="space-y-2 text-xs">
                                <li><a href="#home" className="hover:text-white transition-colors">Accueil</a></li>
                                <li><a href="#about" className="hover:text-white transition-colors">À propos</a></li>
                                <li><a href="#events" className="hover:text-white transition-colors">Archives</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white text-sm mb-4">Connectez-vous</h4>
                            <Button
                                onClick={() => navigate('/login')}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs"
                            >
                              <LockIcon className="mr-1.5 h-3.5 w-3.5"/> Connexion
                            </Button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
                        © {new Date().getFullYear()} {churchInfo.churchName}. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}