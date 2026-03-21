import { Link, useLocation } from 'react-router-dom';

interface TopNavBarProps {
  hasSearchBar?: boolean;
}

export function TopNavBar() {
  return (
    <nav className="fixed top-0 right-0 w-fit z-50 p-4 font-headline antialiased">
      <div className="flex flex-col items-end gap-2">
        {/* Top Line: Notifications, Name, Avatar */}
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-sm border border-slate-100/50">
          <button className="text-slate-500 hover:text-slate-900 transition-all active:scale-90 p-1">
            <span className="material-symbols-outlined text-[1.4rem]">notifications</span>
          </button>
          
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <span className="text-sm font-bold text-slate-900">Alex Rivers</span>
            <Link to="/profile" className="h-9 w-9 rounded-xl overflow-hidden border border-slate-200 hover:border-primary transition-all active:scale-95 shadow-sm">
              <img
                alt="Profile avatar"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-s4tYwpbzLXg2tdVUn-MlZOvhACmJmBsEqb0-H6mz5DOSVnQ5f6GezjyX_0s4pzsczwR6j5IJmoL7SFlex3XzC-iqkjrelAFU5taR_tdR-q27mcpCIb9AdkzBYIKH6EYDPZ0gChHAFXd9v0juq6yFPFoHLdFOm76Wt46LhLyM-R7bb20czVPOvMWokQFfmjPFyUSapVtJCD5Zf9VflVB_ZtyQaUfglwxyLXDiEqj6_9W7WYBj6GzoH0wcBWZA7jsJE5tf9Im4pe4"
              />
            </Link>
          </div>
        </div>

        {/* Bottom Line: Sign Out */}
        <Link 
          to="/" 
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-all text-[11px] font-bold uppercase tracking-wider group"
        >
          <span className="material-symbols-outlined text-[1rem]">logout</span>
          Sign Out
        </Link>
      </div>
    </nav>
  );
}
