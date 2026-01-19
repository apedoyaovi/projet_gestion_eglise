import { Home, Users, Wallet, Calendar, Settings, X, UserPlus, ArrowUpRight, ArrowDownRight, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: Home },
    { name: 'Membres', href: '/members', icon: Users },
    { name: 'Trésorerie', href: '/finance', icon: Wallet },
    { name: 'Événements', href: '/events', icon: Calendar },
    { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-white">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-full flex-col border-r">
                    {/* Close button for mobile */}
                    <div className="flex h-14 items-center justify-between px-4 border-b">
                        <span className="text-lg md:text-xl font-bold text-blue-600">Temple Emmanuel</span>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <SidebarContent onLinkClick={onClose} />
                </div>
            </div>
        </>
    );
}

function SidebarContent({ onLinkClick }) {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

    const filteredNavigation = navigation; // Show all nav items to authenticated users

    const handleLogout = () => {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Close sidebar if on mobile
        if (onLinkClick) onLinkClick();

        // Redirect to landing page
        navigate('/');
    };

    return (
        <>
            {/* Logo - Desktop only */}
            <button
                onClick={() => {
                    navigate('/');
                    if (onLinkClick) onLinkClick();
                }}
                className="hidden lg:flex h-16 w-full items-center px-6 border-b hover:bg-gray-50 hover:text-blue-600 cursor-pointer transition-colors"
                title="Retour à la page d'accueil"
            >
                <span className="text-xl font-bold text-blue-600">TEMPLE EMMANUEL</span>
            </button>

            {/* Add Buttons */}
            <div className="p-4 border-b space-y-6">
                <NavLink to="/members/new" onClick={onLinkClick}>
                    <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="h-4 w-4" />
                        Ajouter membre
                    </Button>
                </NavLink>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <NavLink to="/finance/income" onClick={onLinkClick}>
                        <Button variant="outline" size="sm" className="w-full justify-start gap-1 px-2 text-green-600 border-green-200 hover:bg-green-50" title="Nouvelle Recette">
                            <ArrowUpRight className="h-4 w-4" />
                            <span className="truncate">Recette</span>
                        </Button>
                    </NavLink>
                    <NavLink to="/finance/expense" onClick={onLinkClick}>
                        <Button variant="outline" size="sm" className="w-full justify-start gap-1 px-2 text-red-600 border-red-200 hover:bg-red-50" title="Nouvelle Dépense">
                            <ArrowDownRight className="h-4 w-4" />
                            <span className="truncate">Dépense</span>
                        </Button>
                    </NavLink>
                </div>
            </div>


            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {filteredNavigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={onLinkClick}
                        className={({ isActive }) =>
                            `group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon
                            className="mr-3 h-5 w-5 flex-shrink-0"
                            aria-hidden="true"
                        />
                        {item.name}
                    </NavLink>
                ))}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-colors mt-auto"
                >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    Déconnexion
                </button>
            </nav>

            {/* Footer */}
            <div className="border-t p-4">
                <div className="text-xs text-gray-500 text-center">
                    <p>Version 1.0.0</p>
                    <p className="mt-1">© 2026 Temple Emmanuel</p>
                </div>
            </div>
        </>
    );
}
