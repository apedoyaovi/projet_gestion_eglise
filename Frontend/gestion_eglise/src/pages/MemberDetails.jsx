import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Calendar, Mail, MapPin, Briefcase, Users, Church, Heart, Edit, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MemberDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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
                setMember(data);
            } else {
                console.error("Failed to fetch member details");
            }
        } catch (error) {
            console.error("Error fetching member:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMember();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.")) {
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/members/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            if (response.ok) {
                navigate('/members');
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Une erreur est survenue.");
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <p className="text-muted-foreground text-lg">Chargement des détails...</p>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => navigate('/members')} className="pl-0">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la liste
                </Button>
                <p className="text-center py-12 text-red-500">Membre non trouvé.</p>
            </div>
        );
    }

    const birthDateStr = member.birthDate || member.dob;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/members')} className="pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la liste
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/members/edit/${id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                {/* Profile Card */}
                <Card className="w-full lg:w-1/3">
                    <CardContent className="pt-6 text-center">
                        <div className="mb-4 h-24 w-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center relative">
                            {member.gender === 'Femme' ? (
                                <User className="h-12 w-12 text-pink-500" />
                            ) : (
                                <User className="h-12 w-12 text-blue-600" />
                            )}
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold">{member.firstName || member.firstname} {member.lastName || member.lastname}</h2>
                        <p className="text-sm font-semibold text-blue-600 mt-1">{member.matricule || 'ID-PENDING'}</p>

                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${(member.status || '').toLowerCase() === 'actif'
                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                                }`}>
                                {member.status || 'Nouveau'}
                            </span>
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset bg-gray-50 text-gray-700 ring-gray-600/20">
                                {member.gender}
                            </span>
                        </div>

                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <Phone className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold">Téléphone</p>
                                    <span className="font-medium">{member.phoneNumber || member.phone || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <Mail className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold">Email</p>
                                    <span className="font-medium break-all">{member.email || 'Non renseigné'}</span>
                                </div>
                            </div>
                            <div className="flex items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <Calendar className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold">Naissance</p>
                                    <span className="font-medium">{calculateAge(birthDateStr)} ans ({birthDateStr ? new Date(birthDateStr).toLocaleDateString('fr-FR') : 'N/A'})</span>
                                </div>
                            </div>
                            {(member.profession) && (
                                <div className="flex items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Briefcase className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold">Profession</p>
                                        <span className="font-medium">{member.profession}</span>
                                    </div>
                                </div>
                            )}
                            {(member.memberGroup || member.group) && (
                                <div className="flex items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Users className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold">Département</p>
                                        <span className="font-medium">{member.memberGroup || member.group}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Details sections */}
                <div className="w-full lg:w-2/3 space-y-4 md:space-y-6">
                    {/* Household / Marriage */}
                    <Card className="overflow-hidden border-none shadow-md">
                        <div className="h-1 bg-pink-500 w-full"></div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-pink-600" />
                                Situation Matrimoniale
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Statut Matrimonial</p>
                                <p className="font-semibold text-gray-900">{member.maritalStatus || 'Non renseigné'}</p>
                            </div>
                            {(member.maritalStatus || "").includes("Marié") && (
                                <>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Date de Mariage</p>
                                        <p className="font-semibold text-gray-900">
                                            {member.marriageDate ? new Date(member.marriageDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg sm:col-span-2">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Lieu de Mariage</p>
                                        <p className="font-semibold text-gray-900">{member.marriagePlace || 'N/A'}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Spiritual Information */}
                    <Card className="overflow-hidden border-none shadow-md">
                        <div className="h-1 bg-blue-600 w-full"></div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Church className="h-5 w-5 text-blue-600" />
                                Vie Spirituelle & Église
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                            <div className="bg-slate-50 p-3 rounded-lg border-l-2 border-blue-200">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Date d'arrivée</p>
                                <p className="font-semibold">
                                    {member.arrivalDate ? new Date(member.arrivalDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non renseigné'}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border-l-2 border-blue-200">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Date de Baptême</p>
                                <p className="font-semibold">
                                    {member.baptismDate ? new Date(member.baptismDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non baptisé'}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border-l-2 border-blue-200">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Lieu de Baptême</p>
                                <p className="font-semibold text-gray-900">{member.baptismLocation || 'Non renseigné'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border-l-2 border-blue-200">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Groupe / Département</p>
                                <p className="font-semibold text-gray-900">{member.memberGroup || member.group || 'Aucun groupe'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Departure Information (if applicable) */}
                    {(member.departureDate || member.departureReason) && (
                        <Card className="overflow-hidden border-none shadow-md bg-red-50/30">
                            <div className="h-1 bg-red-600 w-full"></div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <LogOut className="h-5 w-5" />
                                    Informations de Départ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                                <div className="bg-white p-3 rounded-lg border border-red-100">
                                    <p className="text-xs text-red-400 font-bold uppercase mb-1">Date de départ</p>
                                    <p className="font-bold text-red-900 text-lg">
                                        {member.departureDate ? new Date(member.departureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-red-100">
                                    <p className="text-xs text-red-400 font-bold uppercase mb-1">Motif</p>
                                    <p className="font-medium text-red-950">{member.departureReason || 'Non renseigné'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Address Card */}
                    <Card className="overflow-hidden border-none shadow-md">
                        <div className="h-1 bg-slate-400 w-full"></div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-700">
                                <MapPin className="h-5 w-5 text-gray-600" />
                                Localisation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Adresse de résidence</p>
                                <p className="font-medium text-lg text-gray-900">{member.address || 'Non renseignée'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
