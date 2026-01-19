import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Plus, Wallet, Building2, ArrowUpRight, ArrowDownRight, Printer, RefreshCw, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
    const [incomeSearch, setIncomeSearch] = useState('');
    const [expenseSearch, setExpenseSearch] = useState('');
    const [visibleIncomes, setVisibleIncomes] = useState(5);
    const [visibleExpenses, setVisibleExpenses] = useState(5);

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

    const {
        soldeCaisseAnterieur,
        soldeBanqueAnterieur,
        currentCaisseBalance,
        currentBanqueBalance,
        totalIncome,
        totalExpense
    } = stats;

    // Filter and Paginate Incomes
    const filteredIncomes = transactions
        .filter(t => t.type === 'INCOME')
        .filter(t =>
            (t.category?.toLowerCase() || '').includes(incomeSearch.toLowerCase()) ||
            (t.date?.toLowerCase() || '').includes(incomeSearch.toLowerCase()) ||
            (t.amount?.toString() || '').includes(incomeSearch.toLowerCase())
        );
    const displayedIncomes = filteredIncomes.slice(0, visibleIncomes);

    // Filter and Paginate Expenses
    const filteredExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .filter(t =>
            (t.description?.toLowerCase() || '').includes(expenseSearch.toLowerCase()) ||
            (t.date?.toLowerCase() || '').includes(expenseSearch.toLowerCase()) ||
            (t.amount?.toString() || '').includes(expenseSearch.toLowerCase())
        );
    const displayedExpenses = filteredExpenses.slice(0, visibleExpenses);

    const formatAmount = (amount) => {
        if (amount === undefined || amount === null) amount = 0;
        // Regex simple pour les milliers avec un espace standard pour éviter les caractères parasites dans le PDF
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' FCFA';
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const now = new Date();
            const dateStr = now.toLocaleDateString('fr-FR');

            // Header
            doc.setFontSize(18);
            doc.text('Journal de Trésorerie', 105, 15, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Date d'exportation: ${dateStr}`, 105, 22, { align: 'center' });

            // Summary Info
            doc.setFontSize(12);
            doc.text(`Solde Caisse: ${formatAmount(currentCaisseBalance)}`, 14, 35);
            doc.text(`Solde Banque: ${formatAmount(currentBanqueBalance)}`, 14, 42);
            doc.text(`Total Disponible: ${formatAmount(currentCaisseBalance + currentBanqueBalance)}`, 14, 49);

            // Incomes Table
            doc.setFontSize(14);
            doc.setTextColor(34, 197, 94); // Green
            doc.text('RESSOURCES (Entrées)', 14, 65);

            const incomeRows = filteredIncomes.map(item => [
                item.date,
                item.category,
                formatAmount(item.amount)
            ]);

            autoTable(doc, {
                startY: 70,
                head: [['Date', 'Libellé', 'Montant']],
                body: incomeRows.length > 0 ? incomeRows : [['---', 'Aucune donnée', '0 FCFA']],
                headStyles: { fillColor: [34, 197, 94] },
                columnStyles: {
                    2: { halign: 'left' }
                },
                margin: { left: 14, right: 14 }
            });

            // Expenses Table
            const finalY = (doc.lastAutoTable?.finalY || 80) + 15;
            doc.setFontSize(14);
            doc.setTextColor(239, 68, 68); // Red
            doc.text('EMPLOIS (Sorties)', 14, finalY);

            const expenseRows = filteredExpenses.map(item => [
                item.date,
                item.description,
                formatAmount(item.amount)
            ]);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Date', 'Désignation', 'Montant']],
                body: expenseRows.length > 0 ? expenseRows : [['---', 'Aucune donnée', '0 FCFA']],
                headStyles: { fillColor: [239, 68, 68] },
                columnStyles: {
                    2: { halign: 'left' }
                },
                margin: { left: 14, right: 14 }
            });

            doc.save(`journal_finance_${dateStr.replace(/\//g, '-')}.pdf`);
        } catch (error) {
            console.error("PDF Export Error:", error);
            alert("Erreur lors de la génération du PDF. Vérifiez la console.");
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Trésorerie & Finances</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Gestion des entrées (Ressources) et sorties (Emplois).</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="flex-1 sm:flex-none text-sm" onClick={exportToPDF}>
                        <Printer className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Exporter Journal PDF</span>
                        <span className="sm:hidden">PDF</span>
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
                        <div className="text-2xl font-bold">{formatAmount(currentCaisseBalance)}</div>
                        <p className="text-xs text-muted-foreground">Initial: {formatAmount(soldeCaisseAnterieur)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solde Banque (FUCEC)</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(currentBanqueBalance)}</div>
                        <p className="text-xs text-muted-foreground">Initial: {formatAmount(soldeBanqueAnterieur)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900">Solde Total Disponibile</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{formatAmount(currentCaisseBalance + currentBanqueBalance)}</div>
                        <p className="text-xs text-blue-600">Caisse + Fucec</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger View (Split Income/Expense) */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-green-100">
                    <CardHeader className="bg-green-50/50 pb-3">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-green-700">RESSOURCES (Entrées)</CardTitle>
                            <span className="text-sm font-bold text-green-700">Total: {formatAmount(totalIncome)}</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher une recette..."
                                className="pl-8 h-9"
                                value={incomeSearch}
                                onChange={(e) => setIncomeSearch(e.target.value)}
                            />
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
                                {displayedIncomes.length > 0 ? (
                                    displayedIncomes.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell className="text-right font-medium text-green-600">+{formatAmount(item.amount)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                            Aucune recette trouvée
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {filteredIncomes.length > visibleIncomes && (
                            <div className="p-4 border-t text-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-700 hover:text-green-800 hover:bg-green-50"
                                    onClick={() => setVisibleIncomes(prev => prev + 5)}
                                >
                                    Voir plus ({filteredIncomes.length - visibleIncomes} restants)
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-red-100">
                    <CardHeader className="bg-red-50/50 pb-3">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-red-700">EMPLOIS (Sorties)</CardTitle>
                            <span className="text-sm font-bold text-red-700">Total: {formatAmount(totalExpense)}</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher une dépense..."
                                className="pl-8 h-9"
                                value={expenseSearch}
                                onChange={(e) => setExpenseSearch(e.target.value)}
                            />
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
                                {displayedExpenses.length > 0 ? (
                                    displayedExpenses.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right font-medium text-red-600">-{formatAmount(item.amount)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                            Aucune dépense trouvée
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {filteredExpenses.length > visibleExpenses && (
                            <div className="p-4 border-t text-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-700 hover:text-red-800 hover:bg-red-50"
                                    onClick={() => setVisibleExpenses(prev => prev + 5)}
                                >
                                    Voir plus ({filteredExpenses.length - visibleExpenses} restants)
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
