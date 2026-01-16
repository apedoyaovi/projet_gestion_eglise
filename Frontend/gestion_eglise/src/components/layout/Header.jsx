import { useState, useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';

export function Header({ onMenuClick }) {
    const [userName, setUserName] = useState('Admin');
    const [userInitials, setUserInitials] = useState('A');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.fullName) {
            setUserName(user.fullName);
            // Generate initials from full name
            const names = user.fullName.split(' ');
            const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
            setUserInitials(initials.substring(0, 2)); // Max 2 letters
        }
    }, []);

    return (
        <div className="flex h-14 md:h-16 items-center justify-between border-b bg-white px-4 md:px-6">
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                    <Menu className="h-6 w-6" />
                </button>

                {/* Search bar - hidden on mobile */}
                <div className="relative hidden sm:block">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="block w-48 md:w-64 rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Search icon for mobile */}
                <button className="sm:hidden text-gray-400 hover:text-gray-500">
                    <Search className="h-5 w-5" />
                </button>

                <button className="text-gray-400 hover:text-gray-500 relative">
                    <Bell className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                        3
                    </span>
                </button>

                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {userInitials}
                    </div>
                    <span className="hidden md:inline text-sm font-medium text-gray-700">{userName}</span>
                </div>
            </div>
        </div>
    );
}
