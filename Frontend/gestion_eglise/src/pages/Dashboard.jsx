import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



export function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        men: 0,
        women: 0,
        youth: 0,
        children: 0,
        newThisMonth: 0
    });
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;

                if (!token) {
                    navigate('/login');
                    return;
                }

                const fetchWithAuth = (url) => fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const [membersRes, eventsRes, statsRes, monthlyStatsRes] = await Promise.all([
                    fetchWithAuth('http://localhost:8080/api/members'),
                    fetchWithAuth('http://localhost:8080/api/events'),
                    fetchWithAuth('http://localhost:8080/api/transactions/stats'),
                    fetchWithAuth('http://localhost:8080/api/transactions/monthly-stats')
                ]);

                console.log("Stats API responses:", {
                    members: membersRes.status,
                    events: eventsRes.status,
                    stats: statsRes.status,
                    monthly: monthlyStatsRes.status
                });

                if (membersRes.ok && eventsRes.ok && statsRes.ok) {
                    const members = await membersRes.json();
                    const events = await eventsRes.json();
                    const treasuryStats = await statsRes.json();

                    let monthlyStats = [];
                    if (monthlyStatsRes.ok) {
                        monthlyStats = await monthlyStatsRes.json();
                        console.log("Monthly Stats data:", monthlyStats);
                    } else {
                        console.warn("Monthly stats endpoint failed with status:", monthlyStatsRes.status);
                    }

                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();

                    // Member Stats
                    const mStats = members.reduce((acc, m) => {
                        acc.totalMembers++;
                        if (m.gender === 'Homme') acc.men++;
                        if (m.gender === 'Femme') acc.women++;

                        const dob = m.birthDate || m.dob;
                        if (dob) {
                            const birthDate = new Date(dob);
                            let age = now.getFullYear() - birthDate.getFullYear();
                            if (now.getMonth() < birthDate.getMonth() || (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())) {
                                age--;
                            }
                            if (age < 15) acc.children++;
                            else if (age < 35) acc.youth++;
                        }

                        const arrival = m.arrivalDate ? new Date(m.arrivalDate) : null;
                        if (arrival && arrival.getMonth() === currentMonth && arrival.getFullYear() === currentYear) {
                            acc.newThisMonth++;
                        }
                        return acc;
                    }, { totalMembers: 0, men: 0, women: 0, youth: 0, children: 0, newThisMonth: 0 });

                    setStats({
                        ...mStats,
                        totalEvents: events.length,
                        upcomingEvents: [],
                        eventsThisMonth: 0,
                        totalIncome: treasuryStats.totalIncome,
                        totalExpense: treasuryStats.totalExpense,
                        totalBalance: treasuryStats.totalBalance
                    });

                    setChartData(monthlyStats);
                } else {
                    console.error("One or more required stats endpoints failed.");
                }
            } catch (error) {
                console.error("Dashboard stats error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [navigate]);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Chargement du tableau de bord...</div>;
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-blue-600 pl-4">
                    Tableau de Bord
                </h1>
                <div className="flex items-center space-x-2">
                    <span className="text-xs md:text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                        Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
                    </span>
                </div>
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-5">
                <Card className="hover:shadow-md transition-shadow border-none bg-gradient-to-br from-blue-50 to-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-bold text-slate-600 uppercase">Total Membres</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-3xl font-black text-slate-900">{stats.totalMembers}</div>
                        <p className="text-xs text-blue-600/70 font-semibold">+{stats.newThisMonth} ce mois-ci</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-none bg-gradient-to-br from-indigo-50 to-white shadow-sm" onClick={() => navigate('/events')} style={{ cursor: 'pointer' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-bold text-slate-600 uppercase">Événements</CardTitle>
                        <Calendar className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-3xl font-black text-slate-900">{stats.totalEvents}</div>
                        <p className="text-xs text-indigo-600/70 font-semibold">Total enregistré</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-none bg-gradient-to-br from-green-50 to-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-bold text-slate-600 uppercase">Solde Actuel</CardTitle>
                        <Wallet className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-3xl font-black text-slate-900">{stats.totalBalance?.toLocaleString() || 0} <span className="text-xs md:text-sm font-bold text-slate-400">FCFA</span></div>
                        <p className="text-xs text-green-600/70 font-semibold italic">Caisse + Fucec</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-none bg-gradient-to-br from-emerald-50 to-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-bold text-slate-600 uppercase">Total Recettes</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-black text-slate-900">{stats.totalIncome?.toLocaleString() || 0} <span className="text-[10px] md:text-xs font-bold text-slate-400">FCFA</span></div>
                        <p className="text-xs text-emerald-600 font-bold">Total cumulé</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-none bg-gradient-to-br from-rose-50 to-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-bold text-slate-600 uppercase">Total Dépenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-black text-slate-900">{stats.totalExpense?.toLocaleString() || 0} <span className="text-[10px] md:text-xs font-bold text-slate-400">FCFA</span></div>
                        <p className="text-xs text-rose-600 font-bold">Total cumulé</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-none shadow-sm">
                    <CardHeader className="border-b pb-4 mb-4">
                        <CardTitle className="text-lg font-bold text-slate-800">Aperçu Financier Semestriel</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[250px] md:h-[300px] w-full" style={{ minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dx={-10} tickFormatter={(value) => `${value} FCFA`} />
                                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value} FCFA`]} />
                                    <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Recettes" barSize={20} />
                                    <Bar dataKey="expense" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Dépenses" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-sm">
                    <CardHeader className="border-b pb-4 mb-4">
                        <CardTitle className="text-lg font-bold text-slate-800">Démographie des Membres</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="h-3 w-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200" />
                                    <span className="text-sm font-bold text-slate-700">Hommes</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-blue-700">{stats.men}</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{stats.totalMembers > 0 ? Math.round((stats.men / stats.totalMembers) * 100) : 0}%</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-pink-50/50 rounded-xl hover:bg-pink-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="h-3 w-3 rounded-full bg-pink-500 shadow-sm shadow-pink-200" />
                                    <span className="text-sm font-bold text-slate-700">Femmes</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-pink-700">{stats.women}</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{stats.totalMembers > 0 ? Math.round((stats.women / stats.totalMembers) * 100) : 0}%</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-50/50 rounded-xl hover:bg-yellow-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-200" />
                                    <span className="text-sm font-bold text-slate-700">Jeunes (-35 ans)</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-yellow-700">{stats.youth}</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{stats.totalMembers > 0 ? Math.round((stats.youth / stats.totalMembers) * 100) : 0}%</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                                    <span className="text-sm font-bold text-slate-700">Enfants (-15 ans)</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-emerald-700">{stats.children}</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{stats.totalMembers > 0 ? Math.round((stats.children / stats.totalMembers) * 100) : 0}%</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
