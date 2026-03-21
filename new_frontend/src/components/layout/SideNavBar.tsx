import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'auto_stories', label: 'Explore Courses', path: '/courses' },
  { icon: 'settings', label: 'Settings', path: '#' },
];

export function SideNavBar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/courses') return location.pathname === '/courses';
    return false;
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-[#f0f7ff] flex flex-col p-3 border-r border-blue-100 shadow-sm font-body">
      <div className="px-3 pt-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2e3440] flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-xl">school</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-[#2e3440] leading-none tracking-tight font-headline">FundMySkill</h2>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#3b4252] font-black mt-1">Deep Work</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 px-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              isActive(item.path)
                ? 'bg-white text-[#5e81ac] shadow-md shadow-[#5e81ac]/10'
                : 'text-[#2e3440] hover:bg-white/70 hover:text-[#5e81ac]'
            }`}
          >
            <span className={`material-symbols-outlined text-[1.3rem] ${isActive(item.path) ? 'font-bold' : ''}`}>{item.icon}</span>
            <span className="font-headline font-black text-[12px] uppercase tracking-[0.1em]">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-blue-100 flex flex-col gap-3.5 px-1 mb-1">
        {/* User Block: PFP - Name | Notif */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <Link to="/profile" className="h-9 w-9 rounded-lg overflow-hidden shadow-sm border border-white hover:border-primary transition-all active:scale-95 shrink-0">
              <img
                alt="Profile"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-s4tYwpbzLXg2tdVUn-MlZOvhACmJmBsEqb0-H6mz5DOSVnQ5f6GezjyX_0s4pzsczwR6j5IJmoL7SFlex3XzC-iqkjrelAFU5taR_tdR-q27mcpCIb9AdkzBYIKH6EYDPZ0gChHAFXd9v0juq6yFPFoHLdFOm76Wt46LhLyM-R7bb20czVPOvMWokQFfmjPFyUSapVtJCD5Zf9VflVB_ZtyQaUfglwxyLXDiEqj6_9W7WYBj6GzoH0wcBWZA7jsJE5tf9Im4pe4"
              />
            </Link>
            <span className="text-[11px] font-black text-[#2e3440] truncate max-w-[100px] font-headline uppercase tracking-tight">Alex Rivers</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="w-[1px] h-4 bg-blue-100"></div>
            <button className="text-[#2e3440] hover:text-[#5e81ac] transition-all active:scale-90 p-1">
              <span className="material-symbols-outlined text-[1.2rem] font-bold">notifications</span>
            </button>
          </div>
        </div>

        {/* Sign Out Button - Padded */}
        <div className="px-1">
          <Link to="/" className="w-full flex items-center justify-center gap-2 py-3 bg-[#2e3440] text-white hover:bg-[#3b4252] rounded-xl transition-all font-headline font-black text-[10px] uppercase tracking-[0.15em] active:scale-[0.98]">
            <span className="material-symbols-outlined text-[1rem]">logout</span>
            Sign Out
          </Link>
        </div>
      </div>
    </aside>
  );
}
