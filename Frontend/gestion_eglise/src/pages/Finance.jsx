import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wallet, Building2, ArrowUpRight, ArrowDownRight, Printer, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';

export function Finance() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        soldeCaisseAnterieur: 0,
        soldeBanqueAnterieur: 0,
        currentCaisseBalance: 0,
        currentBanqueBalance: 0,
        totalBalance: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;

        if (!token) {
            navigate('/login');
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            const [transRes, statsRes] = await Promise.all([
                fetch('http://localhost:8080/api/transactions', { headers }),
                fetch('http://localhost:8080/api/transactions/stats', { headers })
            ]);

            if (transRes.ok && statsRes.ok) {
                const transData = await transRes.json();
                const statsData = await statsRes.json();
                setTransactions(transData);
                setStats(statsData);
            }
        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Derived state for the Ledger View
    const incomes = transactions.filter(t => t.type === 'INCOME');
    const expenses = transactions.filter(t => t.type === 'EXPENSE');

    const {
        soldeCaisseAnterieur,
        soldeBanqueAnterieur,
        currentCaisseBalance,
        currentBanqueBalance,
        totalIncome,
        totalExpense
    } = stats;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Trésorerie & Finances</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Gestion des entrées (Ressources) et sorties (Emplois).</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="flex-1 sm:flex-none text-sm">
                        <Printer className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Imprimer Journal</span>
                        <span className="sm:hidden">Imprimer</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-none text-green-600 border-green-200 hover:bg-green-50 text-sm"
                        onClick={() => navigate('/finance/income')}
                    >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Nouvelle Recette</span>
                        <span className="sm:hidden">Recette</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50 text-sm"
                        onClick={() => navigate('/finance/expense')}
                    >
                        <ArrowDownRight className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Nouvelle Dépense</span>
                        <span className="sm:hidden">Dépense</span>
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solde Caisse</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentCaisseBalance.toLocaleString()} FCFA</div>
                        <p className="text-xs text-muted-foreground">Initial: {soldeCaisseAnterieur.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solde Banque (FUCEC)</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentBanqueBalance.toLocaleString()} FCFA</div>
                        <p className="text-xs text-muted-foreground">Initial: {soldeBanqueAnterieur.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900">Solde Total Disponibile</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{(currentCaisseBalance + currentBanqueBalance).toLocaleString()} FCFA</div>
                        <p className="text-xs text-blue-600">Caisse + Fucec</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger View (Split Income/Expense) */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-green-100">
                    <CardHeader className="bg-green-50/50 pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-green-700">RESSOURCES (Entrées)</CardTitle>
                            <span className="text-sm font-bold text-green-700">Total: {totalIncome.toLocaleString()}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Libellé</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incomes.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell className="text-right font-medium text-green-600">+{item.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-red-100">
                    <CardHeader className="bg-red-50/50 pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-red-700">EMPLOIS (Sorties)</CardTitle>
                            <span className="text-sm font-bold text-red-700">Total: {totalExpense.toLocaleString()}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Désignation</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right font-medium text-red-600">-{item.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
