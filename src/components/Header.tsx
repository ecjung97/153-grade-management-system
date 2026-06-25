// src/components/Header.tsx
import { Search, Plus, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const navigate = useNavigate();

    return (
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                    <Menu size={24} />
                </button>
                <div className="relative flex-1 md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for a student..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 ml-4">
                <button
                    onClick={() => navigate('/record-results')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Record Assessment</span>
                </button>
            </div>
        </header>
    );
}