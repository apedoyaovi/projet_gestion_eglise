import { useState, useEffect } from 'react';
import { Bell, Search, Menu, X, Check } from 'lucide-react';
import { API_URLS } from '@/lib/api.jsBase';

export function Header({ onMenuClick }) {
    const [userName, setUserName] = useState('Admin');
    const [userInitials, setUserInitials] = useState('A');

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.email || !user.token) return;

        try {
            const response = await fetch(`${API_URLS.NOTIFICATIONS}?email=${user.email}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                const count = data.filter(n => !n.read).length;
                setUnreadCount(count);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.fullName) {
            setUserName(user.fullName);
            const names = user.fullName.split(' ');
            const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
            setUserInitials(initials.substring(0, 2));
        }

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        try {
            const response = await fetch(`${API_URLS.NOTIFICATIONS}/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        try {
            const response = await fetch(`${API_URLS.NOTIFICATIONS}/read-all?email=${user.email}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    return (
        <div className="flex h-14 md:h-16 items-center justify-between border-b bg-white px-4 md:px-6 relative">
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

                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="text-gray-400 hover:text-gray-500 relative"
                    >
                        <Bell className="h-5 w-5 md:h-6 md:w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                                    >
                                        Tout marquer comme lu
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 italic text-sm">
                                        Aucune notification
                                    </div>
                                ) : (
                                    notifications.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`p-4 border-b last:border-0 hover:bg-slate-50 transition-colors relative group ${!msg.read ? 'bg-blue-50/40' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${msg.type === 'MEMBER' ? 'bg-green-100 text-green-700' :
                                                        msg.type === 'FINANCE' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {msg.type}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(msg.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="font-bold text-xs text-slate-900 leading-tight">{msg.title}</p>
                                            <p className="text-xs text-slate-500 mt-1 leading-snug">{msg.message}</p>

                                            {!msg.read && (
                                                <button
                                                    onClick={() => markAsRead(msg.id)}
                                                    className="absolute top-4 right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Marquer comme lu"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
