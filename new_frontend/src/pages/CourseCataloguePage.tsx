import { useState } from 'react';
import { Link } from 'react-router-dom';

export const courses = [
  {
    id: '1',
    title: 'Applied Machine Learning & Neural Networks',
    description: 'A deep dive into tensor operations, backpropagation, and large-scale model deployment architectures.',
    instructor: 'Dr. Elena Vance',
    institution: 'Stanford AI Faculty',
    rating: 4.9,
    ratingCount: '2.4k',
    stars: [1, 1, 1, 1, 0.5],
    price: '$149.00',
    badge: 'Best Seller',
    badgeColor: 'text-primary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGrAUlhDlNQD7vRj_KU_qkFaFsRjz12naK2q3EAjwCvX62UxoaAia8cNcAXhYbi_lso-6KtbRK3cPxzq_KYcXMqsIEweqp4E9nyEUMeeGJfSkvkc7b5ezRFAmt4cz70BN9DDRS1GN9u24bdOsY1WWJQToVUIMa4WQdS3KxU6R4cl2UGkOvp13U6CJlM973nPT7vZP6XVcZgBR-DoErBrLw4DEdpy3fxnlLSCNMRoKVHacIZnbbOuEYbysHQTidRlDT8ZtxD-3k-F8',
    instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyUq4Wayh_h4Nht78BIIRJD2t6CM3uRisdZRb5qmv6i2JJp75Z3z3MooWMKUpWD04i2G92kOule5wD08xMTZ5qisIyvxoMD4tFZ2nuZBl3sB03B3Jo33cRv7L2ki-WcWH58MgWZMPmTT3-_vbSz_qTqA46aF5Tj3aaRyyDA5gfUVv6ySvoLtr7vntlQzFnEFWuJX0CjEk1dzHJOi_yTvhBy_6C_9k3eZhPnjNk70CqBjvCCNXJMKU1jccSek3XmTnstf04nYdMjvQ',
  },
  {
    id: '2',
    title: 'Principles of Generative Urban Design',
    description: 'Exploring how algorithmic logic and procedural generation can revitalize urban living spaces.',
    instructor: 'Julian Thorne',
    institution: 'RIBA Gold Medalist',
    rating: 4.8,
    ratingCount: '812',
    stars: [1, 1, 1, 1, 0],
    price: '$199.00',
    badge: 'New Module',
    badgeColor: 'text-tertiary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFOGvl9jwRiAjHGHWmuNrp4LF3g8xNWq2M-FFv8Pje9tjemwIhLjqtLfaH47mu7Nm5jRSgUOfubIJZiSjK4a8aLY-6WTrdE4dCihSw4wNM5sppIHaoxs7K_wKMFdReT99QMBFEsBNfHXxoSWO-BwkhvXiWNeD5XZwSWbPROQWhJVbYwgpfzA87y0H4OJ_FJabcExL0h1UtkLbjq2KsbAyTGedWch6v-z004k8_DsNBqjbxjcrPBw4EVrDRbXqTfvTGEL9Jeq3OJ80',
    instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ7cENpd8Ohf5Z-KSGuPyNTWdTCm0VWZnRhY6aR5bvfIub3xzKRH3GnqRvGav6YnHSDw3JviyQQDq26hWaBLr4F7rNUmsewQNlhII-3oaOq2-FkPSZYpxXU2UNwHx1A_uScYN_3IxXE3RLKEj-OY4HdNZDvBzaAnVjIzI4pe_zvmlx21kEQgP2ui0_BMt5jELo8IE1bQCFB-6LbJRQoEfKu3w6-Psm-6d3prGqNLgLG5Je4pJdSGuv6cx5BpkI2d4lNou9iLEQZI4',
  },
  {
    id: '3',
    title: 'Ethics of the Anthropocene',
    description: 'Navigating the moral landscape of a human-centric era. A philosophical study on global responsibility.',
    instructor: 'Dr. Aris Thorne',
    institution: 'Cambridge Philosophy Fellow',
    rating: 5.0,
    ratingCount: '430',
    stars: [1, 1, 1, 1, 1],
    price: '$89.00',
    badge: null,
    badgeColor: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA43FGrzD7oZN3fIFoGN87K3tqkG2K85SEOVNvNWJTaFIlSqtr9KhXcJMne5SdKtAEnKc-PSRI3sipKFNZu9RmPVOiJRe6vKxoDsnGMzD322FDN7p8sWI8HveMYd-_h9ZPkROdFx8PeBl287ZLhV6zr5kq_FtnZvO7E3SpBz7DLfCQUSiTnl_B-vKJjO36En8mgX1WOUSI8uhwU-wUL0bBfSJaDQ2Wa96m5t67gjfAGu9IMmYLh8ar0IdyUqCIajbnzfKrc8CLZkkc',
    instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgTs8UvGjvJetwA9lemNy-AcVbdbIF5_qZLkvaVs56xGHt3ecljGLw5WuGInRJXEVEJyxBapiv-GGBnQc_CSLu2HNvGVitiwMzsMn45Tf9QD9AhmhqhvjAU7PPOJXe0R_smWKHvJJNrxQyD5yPJsfoazHuIeYahgtAGdH_usaTDzJsL9ZVGU2glNHhyVY2ekUC-SoyrulCj88v1_nDnnYiZDaQAsk1RNXTx5g8eg1md5T67nA4fL4rhXvgg_4DM0pQYMvq3JKkjZ4',
  },
  {
    id: '4',
    title: 'Quantum Mechanics: Field Theory',
    description: 'Rigorous mathematical frameworks for subatomic interactions and quantum entanglement phenomena.',
    instructor: 'Prof. Marcus Chen',
    institution: 'CERN Researcher',
    rating: 4.9,
    ratingCount: '1.1k',
    stars: [1, 1, 1, 1, 0.5],
    price: '$220.00',
    badge: 'Level: Advanced',
    badgeColor: 'text-secondary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRCL3aMvD_6iHhyizNZRAp7j9DtvDVkD2coOp19cCj4RZcVUDXE6d8ckB4TTDbnHeU8lkq2zezCChZs5RXK627rw9_8HmtGlPQi_wPCzlsmRBlL4pxlfvH2HQuQddI6fh2lXaXzVR3lwJOV2W0WWVfRgPIctwT_oIcfKhhO9GN0vg8FG13t-Li8fbeapl6Xwr5Rj3omnwNmVyrHUpnKMuiKVM4AWsZl1qqFz97VmHX9i6K8NBhOpECgQ3NleUs2Q38EQFQDoRpJNE',
    instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5lWbq4nXME82MPhuvnd5_gLn9b8Ve9A1rw183cv18kMTmusK2jKN4_XdgZlX73AAOmrLfLNwFJq5YFEN5uo-xJ68ZhsK32EaQeTIL6IdqUdtZpwJU_MNS6afzLuWmsTEB-_Wgbt6DPsA_blgBAkB6UCrXH5nf1ooiGeS49qhQJLHixXUguja0C8n5WhwH2yA7Ry7yyuTKeGwYP087v6Tir7gmesuPft1oGGpiXSQCho8B6GMXE--NFVJa8YiBWyzr44lOtTbLcwY',
  },
  {
    id: '5',
    title: 'Neuromorphic Engineering',
    description: 'Building chips that mimic the brain architecture for low-power AI processing.',
    instructor: 'Dr. Sarah Chen',
    institution: 'Neuro-Tech Labs',
    rating: 4.8,
    ratingCount: '320',
    stars: [1, 1, 1, 1, 0],
    price: 'Free',
    badge: 'Popular',
    badgeColor: 'text-primary',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
    instructorImage: 'https://i.pravatar.cc/150?u=5',
  },
  {
    id: '6',
    title: 'Distributed Ledger Governance',
    description: 'The socio-economic implications of decentralized trust and algorithmic consensus.',
    instructor: 'Alex Thorne',
    institution: 'Blockchain Institute',
    rating: 4.7,
    ratingCount: '540',
    stars: [1, 1, 1, 1, 0],
    price: 'Free',
    badge: 'Trending',
    badgeColor: 'text-tertiary',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2064&auto=format&fit=crop',
    instructorImage: 'https://i.pravatar.cc/150?u=6',
  },
  {
    id: '7',
    title: 'Cognitive Robotics',
    description: 'Developing high-level reasoning and planning for autonomous laboratory assistants.',
    instructor: 'Prof. Tars Case',
    institution: 'NASA Robotics',
    rating: 4.9,
    ratingCount: '2.1k',
    stars: [1, 1, 1, 1, 0.5],
    price: 'Free',
    badge: null,
    badgeColor: '',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop',
    instructorImage: 'https://i.pravatar.cc/150?u=7',
  },
  {
    id: '8',
    title: 'Bio-Informatics Fundamentals',
    description: 'Using computational tools to decode genomic patterns and protein folding.',
    instructor: 'Dr. Leo Vance',
    institution: 'Oxford Bio-Lab',
    rating: 4.6,
    ratingCount: '890',
    stars: [1, 1, 1, 0.5, 0],
    price: 'Free',
    badge: 'Specialized',
    badgeColor: 'text-secondary',
    image: 'https://images.unsplash.com/photo-1532187875605-2fe3587b1c34?q=80&w=1770&auto=format&fit=crop',
    instructorImage: 'https://i.pravatar.cc/150?u=8',
  },
  {
    id: '9',
    title: 'Advanced Microeconomics',
    description: 'Game theory, mechanism design, and information asymmetry in complex markets.',
    instructor: 'Prof. John Gray',
    institution: 'Yale School of Mgmt',
    rating: 5.0,
    ratingCount: '150',
    stars: [1, 1, 1, 1, 1],
    price: 'Free',
    badge: 'Mastery',
    badgeColor: 'text-primary',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop',
    instructorImage: 'https://i.pravatar.cc/150?u=9',
  },
];

export function StarRating({ stars }: { stars: number[] }) {
  return (
    <div className="flex text-secondary">
      {stars.map((fill, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: `'FILL' ${fill}` }}
        >
          {fill === 0.5 ? 'star_half' : 'star'}
        </span>
      ))}
    </div>
  );
}

export function CourseCataloguePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero / Title Section */}
      <div className="flex gap-10 items-start">
        {/* Filters Sidebar - Now starting level with header */}
        <aside className="w-64 shrink-0 sticky top-8 self-start space-y-10 pr-6">
          <section>
            <h3 className="font-headline font-bold text-[10px] mb-6 uppercase tracking-[0.2em] text-on-surface-variant/70">Category</h3>
            <div className="flex flex-col gap-4">
              {['Computer Science', 'Architecture & Design', 'Theoretical Physics', 'Modern Philosophy'].map((cat, i) => (
                <label key={cat} className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      defaultChecked={i === 0}
                      className="peer appearance-none w-5 h-5 rounded-lg border-2 border-outline-variant checked:bg-primary checked:border-primary transition-all duration-300 cursor-pointer"
                      type="checkbox"
                    />
                    <span className="material-symbols-outlined absolute text-white text-sm scale-0 peer-checked:scale-100 transition-transform duration-300 pointer-events-none">check</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface/80 group-hover:text-primary transition-colors font-body">{cat}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-headline font-bold text-[10px] mb-6 uppercase tracking-[0.2em] text-on-surface-variant/70">Difficulty</h3>
            <div className="flex flex-col gap-2.5">
              {['Foundational', 'Intermediate', 'Mastery'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 font-body text-center border ${
                    selectedDifficulty === diff
                      ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'bg-surface-container-high/50 border-transparent text-on-surface-variant hover:bg-surface-container-highest transition-all'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-headline font-bold text-[10px] mb-6 uppercase tracking-[0.2em] text-on-surface-variant/70">Duration</h3>
            <div className="space-y-6 pt-2">
              <input 
                className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary" 
                type="range" 
                min="2" 
                max="24"
              />
              <div className="flex justify-between text-[9px] font-black text-on-surface-variant/60 uppercase tracking-widest font-body">
                <span className="bg-surface-container-high px-2 py-0.5 rounded-full">2 Weeks</span>
                <span className="bg-surface-container-high px-2 py-0.5 rounded-full">24+ Weeks</span>
              </div>
            </div>
          </section>
        </aside>

        {/* Grid Content */}
        <div className="flex-1">
          {/* Header moved inside main column for better sticky alignment */}
          <header className="mb-10 relative flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-extrabold text-on-surface tracking-tight leading-none font-headline">The Course Catalogue</h1>
              <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                Browse our curated collection of advanced academic modules designed for deep cognitive mastery.
              </p>
            </div>
          </header>

          <div className="flex justify-between items-center mb-6">
            <p className="text-sm font-medium text-on-surface-variant italic">
              Showing <span className="text-primary font-bold">9</span> premium modules
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
              <select className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer">
                <option>Popularity</option>
                <option>Rating</option>
              </select>
            </div>
          </div>

          {/* Compact Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 9).map((course) => (
              <div
                key={course.id}
                className="group relative bg-surface-container-lowest rounded-[1.5rem] p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full border border-outline-variant/10"
              >
                <div className="relative w-full h-36 mb-6 rounded-xl overflow-hidden shadow-sm">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={course.title}
                    src={course.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40"></div>
                  {course.badge && (
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`bg-white/95 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black ${course.badgeColor} uppercase tracking-tight shadow-sm`}>
                        {course.badge}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating stars={course.stars} />
                    <span className="text-xs font-bold text-on-surface-variant opacity-70">{course.rating}</span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors font-headline leading-tight">{course.title}</h3>
                  <p className="text-[12px] text-on-surface-variant mb-6 line-clamp-2 opacity-80">{course.description}</p>
                  <div className="flex items-center gap-3 mb-4 mt-auto">
                    <img className="w-8 h-8 rounded-full bg-slate-100" alt={course.instructor} src={course.instructorImage} />
                    <div>
                      <p className="text-xs font-bold text-on-surface leading-none mb-1">{course.instructor}</p>
                      <p className="text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">{course.institution}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-outline-variant/10">
                  <Link 
                    to={`/courses/${course.id}`}
                    className="w-full py-2 bg-[#2e3440] hover:bg-[#3b4252] flex items-center justify-center text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all active:scale-[0.98] shadow-md shadow-black/5"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
