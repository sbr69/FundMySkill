import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'person_edit', label: 'Your Courses', path: '/my-courses' },
  { icon: 'auto_stories', label: 'Explore Courses', path: '/courses' },
  { icon: 'person', label: 'Profile', path: '/profile' },
];

export function SideNavBar() {
  const location = useLocation();
  const isInsiderView = location.pathname.startsWith('/insider');

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/courses') return location.pathname === '/courses';
    if (path === '/my-courses') return location.pathname === '/my-courses';
    if (path === '/profile') return location.pathname === '/profile';
    return false;
  };

  return (
    <aside className={`h-screen transition-all duration-300 fixed left-0 top-0 z-50 bg-[#f0f7ff] flex flex-col p-3 border-r border-blue-100 shadow-sm font-body ${isInsiderView ? 'w-20 items-center' : 'w-64'}`}>
      <div className={`pt-6 mb-6 ${isInsiderView ? 'px-0 flex justify-center w-full' : 'px-3'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2e3440] flex items-center justify-center shadow-md shrink-0">
            <span className="material-symbols-outlined text-white text-xl">school</span>
          </div>
          {!isInsiderView && (
            <div className="overflow-hidden transition-all duration-300">
              <h2 className="text-xl font-black text-[#2e3440] leading-none tracking-tight font-headline">FundMySkill</h2>
            </div>
          )}
        </div>
      </div>

      <nav className={`flex flex-col gap-1.5 ${isInsiderView ? 'w-full items-center px-0' : 'px-1'}`}>
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            title={item.label}
            className={`flex items-center rounded-2xl transition-all duration-300 ${
              isActive(item.path)
                ? 'bg-white text-[#5e81ac] shadow-md shadow-[#5e81ac]/10'
                : 'text-[#2e3440] hover:bg-white/70 hover:text-[#5e81ac]'
            } ${isInsiderView ? 'justify-center w-12 h-12 p-0' : 'gap-3 px-4 py-3.5'}`}
          >
            <span className={`material-symbols-outlined text-[1.3rem] ${isActive(item.path) ? 'font-bold' : ''}`}>{item.icon}</span>
            {!isInsiderView && (
              <span className="font-body font-bold text-[12px] uppercase tracking-[0.14em] whitespace-nowrap">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className={`mt-auto pt-4 border-t border-blue-100 flex flex-col gap-3.5 mb-1 ${isInsiderView ? 'items-center px-0' : 'px-1'}`}>
        {/* User Block: PFP - Name | Notif */}
        <div className={`flex items-center ${isInsiderView ? 'justify-center w-full' : 'justify-between px-2'}`}>
          <div className="flex items-center gap-2.5">
            <Link to="/profile" className="h-9 w-9 rounded-lg overflow-hidden shadow-sm border border-white hover:border-primary transition-all active:scale-95 shrink-0">
              <img
                alt="Profile"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-s4tYwpbzLXg2tdVUn-MlZOvhACmJmBsEqb0-H6mz5DOSVnQ5f6GezjyX_0s4pzsczwR6j5IJmoL7SFlex3XzC-iqkjrelAFU5taR_tdR-q27mcpCIb9AdkzBYIKH6EYDPZ0gChHAFXd9v0juq6yFPFoHLdFOm76Wt46LhLyM-R7bb20czVPOvMWokQFfmjPFyUSapVtJCD5Zf9VflVB_ZtyQaUfglwxyLXDiEqj6_9W7WYBj6GzoH0wcBWZA7jsJE5tf9Im4pe4"
              />
            </Link>
            {!isInsiderView && (
              <span className="text-[13px] font-bold text-[#2e3440] truncate max-w-[100px] font-headline uppercase tracking-wider">Alex Rivers</span>
            )}
          </div>

          {!isInsiderView && (
            <div className="flex items-center gap-1.5">
              <div className="w-[1px] h-4 bg-blue-100"></div>
              <button className="text-[#2e3440] hover:text-[#5e81ac] transition-all active:scale-95 flex items-center justify-center">
                <span className="material-symbols-outlined text-[1.1rem] font-bold scale-[0.7] origin-center translate-y-[0.5px]">notifications</span>
              </button>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className={isInsiderView ? 'w-full flex justify-center' : 'px-1'}>
          <Link 
            to="/" 
            title="Sign Out"
            className={`flex items-center justify-center bg-[#2e3440] text-white hover:bg-[#3b4252] rounded-xl transition-all active:scale-[0.98] ${
              isInsiderView ? 'w-10 h-10' : 'w-full gap-2 py-3'
            }`}
          >
            <span className="material-symbols-outlined text-[1rem]">logout</span>
            {!isInsiderView && (
              <span className="font-body font-bold text-[11.5px] uppercase tracking-[0.2em] whitespace-nowrap">Sign Out</span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
