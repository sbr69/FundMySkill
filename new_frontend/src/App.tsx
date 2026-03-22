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
import { CourseInsiderPage } from './pages/CourseInsiderPage';

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
  const isStandalonePage = isLandingPage || isQuizView || location.pathname === '/donate' || location.pathname === '/upload-course' || isLessonView;

  // Lesson view has side nav + top nav but also a right chat panel
  const isInsiderView = location.pathname.startsWith('/insider');
  const showSideNav = !isStandalonePage && !isInsiderView;

  if (isStandalonePage) {
    return (
      <div className="min-h-screen bg-surface text-on-surface antialiased font-body">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/donate" element={<DonationPage />} />
          <Route path="/quiz/:quizId" element={<CourseQuizPage />} />
          <Route path="/upload-course" element={<CourseUploadPage />} />
          <Route path="/learn/:courseId/:moduleId/:lessonId" element={<LearningInterfacePage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased font-body relative">
      {showSideNav && <SideNavBar />}

      <main className={`${showSideNav || isInsiderView ? 'pl-64' : ''} min-h-screen`}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CourseCataloguePage />} />
            <Route path="/courses/:courseId" element={<CourseOverviewPage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/insider/:courseId" element={<CourseInsiderPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
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
