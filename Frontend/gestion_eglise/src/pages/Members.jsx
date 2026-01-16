import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, FileSpreadsheet, Search, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export function Members() {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [visibleCount, setVisibleCount] = useState(5);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:8080/api/members', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setMembers(data);
                } else {
                    console.error("Failed to fetch members");
                }
            } catch (error) {
                console.error("Error fetching members:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, [navigate]);

    const filteredMembers = members
        .filter(member =>
            (`${member.firstName || member.firstname || ''} ${member.lastName || member.lastname || ''}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.matricule || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => b.id - a.id); // Sort by latest first

    const displayedMembers = filteredMembers.slice(0, visibleCount);

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Liste des Membres", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);

        const tableColumn = ["Matricule", "Nom", "Prénoms", "Date Naiss.", "Profession", "Groupe", "Contact", "Arrivée", "Baptême", "Lieu Baptême", "Statut"];
        const tableRows = [];

        filteredMembers.forEach(member => {
            const memberData = [
                member.matricule || 'N/A',
                member.lastName || member.lastname || '',
                member.firstName || member.firstname || '',
                member.birthDate || member.dob || '',
                member.profession || '',
                member.memberGroup || member.type || '',
                member.phoneNumber || member.phone || '',
                member.arrivalDate || '',
                member.baptismDate || '',
                member.baptismLocation || member.baptismPlace || '',
                member.status || '',
            ];
            tableRows.push(memberData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: { fontSize: 8 },
            headStyles: { fillStyle: '#1e40af' }
        });

        doc.save(`membres_${new Date().getTime()}.pdf`);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredMembers.map(m => ({
            Matricule: m.matricule || 'N/A',
            Nom: m.lastName || m.lastname || '',
            Prénoms: m.firstName || m.firstname || '',
            "Date de Naissance": m.birthDate || m.dob || '',
            Profession: m.profession || '',
            Groupe: m.memberGroup || m.type || '',
            Contact: m.phoneNumber || m.phone || '',
            "Date d'arrivée": m.arrivalDate || '',
            "Date de Baptême": m.baptismDate || '',
            "Lieu de Baptême": m.baptismLocation || m.baptismPlace || '',
            Statut: m.status || ''
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Membres");
        XLSX.writeFile(workbook, `membres_${new Date().getTime()}.xlsx`);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredMembers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredMembers.map(m => m.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDelete = async (id = null) => {
        const idsToDelete = id ? [id] : selectedIds;
        if (idsToDelete.length === 0) return;

        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${idsToDelete.length > 1 ? 'ces membres' : 'ce membre'} ?`)) {
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;

            const response = await fetch(id
                ? `http://localhost:8080/api/members/${id}`
                : 'http://localhost:8080/api/members/bulk-delete', {
                method: id ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: id ? null : JSON.stringify(idsToDelete)
            });

            if (response.ok) {
                setMembers(members.filter(m => !idsToDelete.includes(m.id)));
                setSelectedIds(selectedIds.filter(i => !idsToDelete.includes(i)));
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Une erreur est survenue lors de la suppression.");
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestion des Membres</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Gérez l'annuaire et le suivi des membres de l'église.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="flex-1 sm:flex-none" onClick={exportToPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Exporter PDF
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none" onClick={exportToExcel}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Exporter Excel
                    </Button>
                    <Button onClick={() => navigate('/members/new')} className="flex-1 sm:flex-none">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau Membre
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <CardTitle>Liste des Membres</CardTitle>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un membre..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setVisibleCount(5);
                            }}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <p className="text-muted-foreground">Chargement des membres...</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="w-[50px]">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                                checked={filteredMembers.length > 0 && selectedIds.length === filteredMembers.length}
                                                onChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold text-slate-700">Matricule</TableHead>
                                        <TableHead className="font-bold text-slate-700">Nom & Prénoms</TableHead>
                                        <TableHead className="font-bold text-slate-700">Groupe</TableHead>
                                        <TableHead className="font-bold text-slate-700">Contact</TableHead>
                                        <TableHead className="font-bold text-slate-700">Statut</TableHead>
                                        <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayedMembers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                Aucun membre trouvé.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        displayedMembers.map((member) => (
                                            <TableRow key={member.id} className={selectedIds.includes(member.id) ? 'bg-blue-50/30' : ''}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                                        checked={selectedIds.includes(member.id)}
                                                        onChange={() => toggleSelect(member.id)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium text-blue-700">{member.matricule || '---'}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 uppercase">{member.lastName || member.lastname}</span>
                                                        <span className="text-xs text-slate-500">{member.firstName || member.firstname}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium text-slate-600">{member.memberGroup || member.type}</TableCell>
                                                <TableCell className="text-sm text-slate-600">{member.phoneNumber || member.phone || '---'}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${(member.status || '').toLowerCase() === 'actif'
                                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                        }`}>
                                                        {member.status || 'Inconnu'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="sm" className="h-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50" onClick={() => navigate(`/members/${member.id}`)}>Détails</Button>
                                                        <Button variant="ghost" size="sm" className="h-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => navigate(`/members/edit/${member.id}`)}>Modifier</Button>
                                                        <Button variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(member.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
                {visibleCount < filteredMembers.length && (
                    <div className="p-4 border-t flex justify-center bg-slate-50/50">
                        <Button
                            variant="outline"
                            className="rounded-xl font-bold text-blue-600 border-blue-100 hover:bg-blue-100 px-8"
                            onClick={() => setVisibleCount(prev => prev + 5)}
                        >
                            Voir plus de membres
                        </Button>
                    </div>
                )}
                {selectedIds.length > 0 && (
                    <CardFooter className="bg-slate-50 border-t py-4 flex items-center justify-between animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700">{selectedIds.length} membres sélectionnés</span>
                            <Button variant="ghost" size="sm" className="h-8 text-blue-600 font-bold" onClick={() => setSelectedIds([])}>Tout désélectionner</Button>
                        </div>
                        <Button variant="destructive" size="sm" className="font-bold gap-2" onClick={() => handleDelete()}>
                            <Trash2 className="h-4 w-4" />
                            Supprimer la sélection ({selectedIds.length})
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
