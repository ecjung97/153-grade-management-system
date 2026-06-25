// src/components/Sidebar.tsx
import { Home, Users, Settings, BookOpen, FileSpreadsheet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Sidebar() {
    const location = useLocation();
    const { currentUser, classes } = useAppContext();

    // Find the subjects the teacher teaches
    const myClasses = classes.filter(c => c.teacherId === currentUser?.id);

    const generalNavItems = [
        { name: 'Dashboard', path: '/', icon: Home },
        { name: 'Assessments History', path: '/assessments', icon: FileSpreadsheet },
    ];

    const bottomNavItems = [
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-wider">153 World Christian School</h1>
                <p className="text-slate-400 text-sm mt-1">Student Grade Management System</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                <nav className="px-4 space-y-2 mt-4">
                    {generalNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-4 pb-2 px-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            My Subjects
                        </p>
                    </div>

                    {myClasses.map((cls) => {
                        const isActive = location.pathname === `/class/${cls.id}`;

                        return (
                            <Link
                                key={cls.id}
                                to={`/class/${cls.id}`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                <BookOpen size={20} />
                                <span className="font-medium">{cls.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-4">
                        {bottomNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {currentUser?.name[0]}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">{currentUser?.name} - {currentUser?.englishName}</p>
                        <p className="text-xs text-slate-400">{currentUser?.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}