import { User, Bell, Lock, Database, Mail, Globe, Clock, Trash2, Plus, Users, ShieldCheck, Eye, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Settings() {
    const [schedules, setSchedules] = useState([]);
    const [newSchedule, setNewSchedule] = useState({ dayOfWeek: '', time: '', label: '' });
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
    const [superMembers, setSuperMembers] = useState([]);
    const [isLoadingSuperMembers, setIsLoadingSuperMembers] = useState(false);
    const [newSuperMember, setNewSuperMember] = useState({ fullName: '', email: '', password: '' });
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [createdSuperMembers, setCreatedSuperMembers] = useState([]); // {id, email, password, fullName}

    const [profile, setProfile] = useState({ fullName: '', email: '' });
    const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [churchInfo, setChurchInfo] = useState({ churchName: '', address: '', phone: '', email: '' });
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('notifications');
        return saved ? JSON.parse(saved) : { newMembers: true, transactions: true, events: true };
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setProfile({
                    fullName: user.fullName || 'Administrateur',
                    email: user.email || ''
                });
                setCurrentUserRole(user.role);
                fetchSchedules(user.token);
                fetchChurchConfig(user.token);
                if (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') {
                    fetchSuperMembers(user.token);
                }
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
            }
        }
    }, []);

    const fetchChurchConfig = async (token) => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8080/api/church-config', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setChurchInfo(data);
            } else if (response.status === 401) {
                console.error("Unauthorized access to church config");
            }
        } catch (error) {
            console.error("Error fetching church config:", error);
        }
    };

    const fetchSchedules = async (token) => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8080/api/schedules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSchedules(data);
            }
        } catch (error) {
            console.error("Error fetching schedules:", error);
        } finally {
            setIsLoadingSchedules(false);
        }
    };

    const fetchSuperMembers = async (token) => {
        if (!token) return;
        setIsLoadingSuperMembers(true);
        try {
            const response = await fetch('http://localhost:8080/api/users/super-members', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSuperMembers(data);
            }
        } catch (error) {
            console.error("Error fetching super members:", error);
        } finally {
            setIsLoadingSuperMembers(false);
        }
    };

    const handleCreateSuperMember = async (e) => {
        e.preventDefault();
        const passwordToStore = newSuperMember.password; // Store before clearing
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const response = await fetch('http://localhost:8080/api/users/create-super-member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newSuperMember)
            });
            if (response.ok) {
                const data = await response.json();
                // Add to created list with password for this session
                setCreatedSuperMembers(prev => [...prev, {
                    email: newSuperMember.email,
                    fullName: newSuperMember.fullName,
                    password: passwordToStore
                }]);
                setNewSuperMember({ fullName: '', email: '', password: '' });
                fetchSuperMembers(token);
                alert("Super Membre créé avec succès ! Note: Le mot de passe ne sera visible que dans cette session.");
            } else {
                const errData = await response.json().catch(() => ({}));
                alert("Erreur lors de la création : " + (errData.message || response.statusText));
            }
        } catch (error) {
            console.error("Error creating super member:", error);
            alert("Erreur de connexion au serveur.");
        }
    };

    const handleDeleteSuperMember = async (id, email) => {
        if (!window.confirm("Supprimer cet accès ?")) return;
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchSuperMembers(token);
                // Remove from created list too
                setCreatedSuperMembers(prev => prev.filter(sm => sm.email !== email));
                alert("Accès supprimé.");
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (error) {
            console.error("Error deleting super member:", error);
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const response = await fetch('http://localhost:8080/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newSchedule)
            });
            if (response.ok) {
                setNewSchedule({ dayOfWeek: '', time: '', label: '' });
                fetchSchedules(token);
                alert("Horaire ajouté avec succès !");
            } else {
                const errData = await response.json().catch(() => ({}));
                alert("Erreur lors de l'ajout : " + (errData.message || response.statusText));
            }
        } catch (error) {
            console.error("Error adding schedule:", error);
            alert("Erreur de connexion au serveur.");
        }
    };

    const handleDeleteSchedule = async (id) => {
        if (!window.confirm("Supprimer cet horaire ?")) return;
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const response = await fetch(`http://localhost:8080/api/schedules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchSchedules(token);
            }
        } catch (error) {
            console.error("Error deleting schedule:", error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert("Session expirée. Veuillez vous reconnecter.");
                return;
            }
            const user = JSON.parse(userStr);
            const token = user?.token;

            if (!user.email) {
                alert("Erreur: Email actuel manquant dans la session.");
                return;
            }

            const response = await fetch('http://localhost:8080/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...profile, currentEmail: user.email })
            });

            if (response.ok) {
                const updatedData = await response.json();
                // Update local storage with new info (including potential new token)
                const newUser = { ...user, ...updatedData };
                localStorage.setItem('user', JSON.stringify(newUser));
                alert("Profil mis à jour avec succès !");
            } else {
                const errorText = await response.text();
                let errorData = {};
                try { errorData = JSON.parse(errorText); } catch (e) { }
                alert("Erreur lors de la mise à jour : " + (errorData.message || response.statusText || "Erreur " + response.status));
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Erreur de connexion au serveur.");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (security.newPassword !== security.confirmPassword) {
            alert("Les nouveaux mots de passe ne correspondent pas");
            return;
        }
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert("Session expirée.");
                return;
            }
            const user = JSON.parse(userStr);
            const token = user?.token;

            if (!user.email) {
                alert("Erreur: Email manquant dans la session.");
                return;
            }

            const response = await fetch('http://localhost:8080/api/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: user.email,
                    currentPassword: security.currentPassword,
                    newPassword: security.newPassword
                })
            });

            if (response.ok) {
                setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
                alert("Mot de passe changé avec succès !");
            } else {
                const errorText = await response.text();
                let errorData = {};
                try { errorData = JSON.parse(errorText); } catch (e) { }
                alert(errorData.message || "Erreur lors du changement de mot de passe (Status: " + response.status + ")");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Erreur de connexion au serveur.");
        }
    };

    const handleUpdateChurchInfo = async (e) => {
        e.preventDefault();
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const token = user?.token;
            const response = await fetch('http://localhost:8080/api/church-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(churchInfo)
            });

            if (response.ok) {
                alert("Informations de l'église mises à jour !");
            } else {
                const errorText = await response.text();
                let errorData = {};
                try { errorData = JSON.parse(errorText); } catch (e) { }
                alert("Erreur lors de la mise à jour de l'église : " + (errorData.message || response.statusText || "Status " + response.status));
            }
        } catch (error) {
            console.error("Error updating church info:", error);
            alert("Erreur de connexion au serveur.");
        }
    };

    const handleNotificationChange = (key) => {
        const newData = { ...notifications, [key]: !notifications[key] };
        setNotifications(newData);
        localStorage.setItem('notifications', JSON.stringify(newData));
    };

    const handleExportData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert("Session expirée. Veuillez vous reconnecter.");
                return;
            }
            const user = JSON.parse(userStr);
            const token = user?.token;

            const response = await fetch('http://localhost:8080/api/users/export-data', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const date = new Date().toISOString().split('T')[0];
                a.download = `sauvegarde_eglise_${date}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                alert("Sauvegarde réussie et téléchargée !");
            } else {
                alert("Erreur lors de la sauvegarde : " + response.statusText);
            }
        } catch (error) {
            console.error("Error exporting data:", error);
            alert("Erreur de connexion au serveur.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
                <p className="text-muted-foreground">Gérez les paramètres de l'application et de votre compte.</p>
            </div>

            <div className="grid gap-6">
                {/* Profil */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <CardTitle>Profil de l'utilisateur</CardTitle>
                        </div>
                        <CardDescription>Informations sur votre compte administrateur</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom complet</Label>
                                    <Input
                                        id="name"
                                        value={profile.fullName}
                                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit">Enregistrer les modifications</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Bell className="h-5 w-5 text-blue-600" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Configurez vos préférences de notification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Nouveaux membres</p>
                                <p className="text-sm text-muted-foreground">Recevoir une notification lors de l'ajout d'un nouveau membre</p>
                            </div>
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={notifications.newMembers}
                                onChange={() => handleNotificationChange('newMembers')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Transactions financières</p>
                                <p className="text-sm text-muted-foreground">Être notifié des nouvelles entrées/sorties</p>
                            </div>
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={notifications.transactions}
                                onChange={() => handleNotificationChange('transactions')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Événements à venir</p>
                                <p className="text-sm text-muted-foreground">Rappels pour les événements planifiés</p>
                            </div>
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={notifications.events}
                                onChange={() => handleNotificationChange('events')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Gestion de l'équipe (SuperMembres) */}
                {(currentUserRole === 'ADMIN' || currentUserRole === 'ROLE_ADMIN') && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                                <CardTitle>Gestion de l'équipe</CardTitle>
                            </div>
                            <CardDescription>Gérez les accès restreints pour les secrétaires ou assistants</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleCreateSuperMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <div className="space-y-2">
                                    <Label>Nom complet</Label>
                                    <Input
                                        placeholder="Ex: Kouame Koffi"
                                        value={newSuperMember.fullName}
                                        onChange={(e) => setNewSuperMember({ ...newSuperMember, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email (Identifiant)</Label>
                                    <Input
                                        type="email"
                                        placeholder="identifiant@eglise.com"
                                        value={newSuperMember.email}
                                        onChange={(e) => setNewSuperMember({ ...newSuperMember, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mot de passe</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newSuperMember.password}
                                        onChange={(e) => setNewSuperMember({ ...newSuperMember, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" /> Créer l'accès
                                </Button>
                            </form>

                            {createdSuperMembers.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                                    <p className="font-bold mb-1">ℹ️ Information importante</p>
                                    <p>Les mots de passe sont affichés uniquement pour les membres créés dans cette session. Après actualisation de la page, ils ne seront plus visibles pour des raisons de sécurité.</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-700">Membres de l'équipe ({superMembers.length})</h3>
                                {isLoadingSuperMembers ? (
                                    <p className="text-sm text-center py-4">Chargement...</p>
                                ) : superMembers.length === 0 ? (
                                    <p className="text-sm text-center text-slate-500 py-4 italic">Aucun super membre créé</p>
                                ) : (
                                    <div className="grid gap-3">
                                        {superMembers.map((sm) => {
                                            const createdInfo = createdSuperMembers.find(c => c.email === sm.email);
                                            return (
                                                <div key={sm.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                            {sm.fullName?.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-slate-900 text-sm">{sm.fullName}</p>
                                                            <p className="text-xs text-slate-500">{sm.email}</p>
                                                            {createdInfo && (
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                                                                        <Eye className="h-3 w-3 text-amber-600" />
                                                                        <span className="text-[10px] font-mono text-amber-700">{createdInfo.password}</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(createdInfo.password);
                                                                            alert('Mot de passe copié !');
                                                                        }}
                                                                        className="p-1 hover:bg-slate-200 rounded"
                                                                        title="Copier le mot de passe"
                                                                    >
                                                                        <Copy className="h-3 w-3 text-slate-500" />
                                                                    </button>
                                                                    <span className="text-[9px] text-amber-600 italic">Visible uniquement dans cette session</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSuperMember(sm.id, sm.email)} className="text-slate-400 hover:text-rose-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sécurité */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Lock className="h-5 w-5 text-blue-600" />
                            <CardTitle>Sécurité</CardTitle>
                        </div>
                        <CardDescription>Gérez la sécurité de votre compte</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Mot de passe actuel</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    value={security.currentPassword}
                                    onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={security.newPassword}
                                    onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                                    required
                                    minLength={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={security.confirmPassword}
                                    onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit">Changer le mot de passe</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Admin-only sections */}
                {(currentUserRole === 'ADMIN' || currentUserRole === 'ROLE_ADMIN') && (
                    <>
                        {/* Paramètres de l'église */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Globe className="h-5 w-5 text-blue-600" />
                                    <CardTitle>Informations de l'église</CardTitle>
                                </div>
                                <CardDescription>Paramètres généraux de l'organisation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleUpdateChurchInfo} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="church-name">Nom de l'église</Label>
                                        <Input
                                            id="church-name"
                                            placeholder="Église Évangélique"
                                            value={churchInfo.churchName}
                                            onChange={(e) => setChurchInfo({ ...churchInfo, churchName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="church-address">Adresse</Label>
                                        <Input
                                            id="church-address"
                                            placeholder="Lomé, Togo"
                                            value={churchInfo.address}
                                            onChange={(e) => setChurchInfo({ ...churchInfo, address: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="church-phone">Téléphone</Label>
                                        <Input
                                            id="church-phone"
                                            placeholder="+228 XX XX XX XX"
                                            value={churchInfo.phone}
                                            onChange={(e) => setChurchInfo({ ...churchInfo, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="church-email">Email</Label>
                                        <Input
                                            id="church-email"
                                            type="email"
                                            placeholder="contact@church.org"
                                            value={churchInfo.email}
                                            onChange={(e) => setChurchInfo({ ...churchInfo, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit">Enregistrer</Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Sauvegarde */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Database className="h-5 w-5 text-blue-600" />
                                    <CardTitle>Sauvegarde des données</CardTitle>
                                </div>
                                <CardDescription>Exportez et sauvegardez vos données</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Sauvegardez l'ensemble des données de l'application (membres, finances, événements) dans un fichier JSON sécurisé.
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleExportData} className="flex-1 sm:flex-none">
                                        <Database className="h-4 w-4 mr-2" />
                                        Exporter toutes les données
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Horaires de Culte */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <CardTitle>Horaires de Culte</CardTitle>
                                </div>
                                <CardDescription>Gérez les horaires des services hebdomadaires</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-lg">
                                    <div className="space-y-2">
                                        <Label>Jour</Label>
                                        <Input
                                            placeholder="Ex: Dimanche"
                                            value={newSchedule.dayOfWeek}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Heure</Label>
                                        <Input
                                            placeholder="Ex: 09h00"
                                            value={newSchedule.time}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            placeholder="Ex: Culte d'adoration"
                                            value={newSchedule.label}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, label: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" /> Ajouter
                                    </Button>
                                </form>

                                <div className="space-y-3">
                                    {isLoadingSchedules ? (
                                        <p className="text-sm text-center text-slate-500 py-4">Chargement...</p>
                                    ) : schedules.length === 0 ? (
                                        <p className="text-sm text-center text-slate-500 py-4 italic">Aucun horaire enregistré</p>
                                    ) : (
                                        schedules.map((s) => (
                                            <div key={s.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="flex gap-4 items-center">
                                                    <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-sm min-w-[100px] text-center">
                                                        {s.dayOfWeek}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{s.label}</p>
                                                        <p className="text-xs text-slate-500 flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" /> {s.time}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteSchedule(s.id)} className="text-slate-400 hover:text-rose-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
