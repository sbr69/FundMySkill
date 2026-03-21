import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react';
import { TopNavBar } from './components/layout/TopNavBar';
import { SideNavBar } from './components/layout/SideNavBar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CourseCataloguePage } from './pages/CourseCataloguePage';
import { LearningInterfacePage } from './pages/LearningInterfacePage';
import { CourseQuizPage } from './pages/CourseQuizPage';
import { ProfilePage } from './pages/ProfilePage';
import { DonationPage } from './pages/DonationPage';
import { MyCoursesPage } from './pages/MyCoursesPage';
import { CourseOverviewPage } from './pages/CourseOverviewPage';
import { CourseUploadPage } from './pages/CourseUploadPage';

// ── Wallet Manager ──────────────────────────────────────────────────
const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    {
      id: WalletId.LUTE,
      options: {
        siteName: 'FundMySkill'
      }
    }
  ],
  defaultNetwork: NetworkId.TESTNET,
});

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/' || location.pathname === '/login';
  const isLessonView = location.pathname.startsWith('/learn');
  const isQuizView = location.pathname.startsWith('/quiz');

  // These pages have their own complete layout (nav, sidebar, etc.)
  const isStandalonePage = isLandingPage || isQuizView || location.pathname === '/donate' || location.pathname === '/upload-course';

  // Lesson view has side nav + top nav but also a right chat panel
  const showSideNav = !isStandalonePage && !isLessonView;
  const showTopNav = !isStandalonePage;

  if (isStandalonePage) {
    return (
      <div className="min-h-screen bg-surface text-on-surface antialiased font-body">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/donate" element={<DonationPage />} />
          <Route path="/quiz/:quizId" element={<CourseQuizPage />} />
          <Route path="/upload-course" element={<CourseUploadPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased font-body relative">
      {showSideNav && <SideNavBar />}

      {isLessonView ? (
        /* Learning interface has its own sidebar nav built into the page */
        <>
          <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 flex-col p-4 gap-2 pt-8">
            <div className="px-4 mb-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-lg font-black text-blue-800">FundMySkill</span>
              </div>
              <p className="text-xs text-slate-500 font-headline">Deep Work Mode</p>
            </div>
            <div className="space-y-1">
              {[
                { icon: 'dashboard', label: 'Dashboard', active: false },
                { icon: 'auto_stories', label: 'My Courses', active: true },
                { icon: 'smart_toy', label: 'AI Tutor', active: false },
                { icon: 'local_library', label: 'Library', active: false },
                { icon: 'settings', label: 'Settings', active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-transform duration-200 hover:translate-x-1 active:opacity-80 ${item.active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-headline font-medium text-sm">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4 space-y-1">
              <div className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer transition-transform duration-200 hover:translate-x-1 active:opacity-80">
                <span className="material-symbols-outlined">contact_support</span>
                <span className="font-headline font-medium text-sm">Support</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer transition-transform duration-200 hover:translate-x-1 active:opacity-80">
                <span className="material-symbols-outlined">logout</span>
                <span className="font-headline font-medium text-sm">Sign Out</span>
              </div>
            </div>
          </aside>
          <main className="lg:pl-64 lg:pr-80 pt-16 min-h-screen">
            <Routes>
              <Route path="/learn/:courseId/:lessonId" element={<LearningInterfacePage />} />
            </Routes>
          </main>
        </>
      ) : (
        <main className={`${showSideNav ? 'pl-64' : ''} min-h-screen`}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CourseCataloguePage />} />
            <Route path="/courses/:courseId" element={<CourseOverviewPage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider manager={walletManager}>
      <Router>
        <AppLayout />
      </Router>
    </WalletProvider>
  );
}
