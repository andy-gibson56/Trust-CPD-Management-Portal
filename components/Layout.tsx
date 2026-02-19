
import React, { ReactNode, useState } from 'react';
import { TRUST_LOGO } from '../constants';
import { Menu, LayoutDashboard, CalendarPlus, UserCheck, MessageSquare, BookOpen, X, LogOut, User, Users, ClipboardList } from 'lucide-react';
import { User as UserType } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleChat: () => void;
  user: UserType | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, toggleChat, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const hasAccess = (tab: string) => {
      return user?.accessibleTabs?.includes(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-gray font-sans text-[14pt]">
      {/* Hero Banner */}
      <section className="w-full min-h-[220px] relative overflow-hidden flex items-center bg-coop-blue border-b-4 border-white">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10">
          {/* Responsive Trust Logo */}
          <div className="flex-shrink-0 transition-all duration-500 transform hover:scale-105">
            <img 
              src={TRUST_LOGO} 
              alt="Co-op Academies Trust" 
              className="h-32 sm:h-40 md:h-48 w-auto object-contain brightness-110" 
            />
          </div>

          {/* Right-aligned Title */}
          <div className="text-center sm:text-right">
            <h1 className="text-white font-black leading-none text-[26pt]">
              CPD <br />Management Portal
            </h1>
            {user && (
                <div className="mt-4 flex items-center justify-center sm:justify-end text-white/80 font-bold space-x-2">
                    <User size={18}/>
                    <span>{user.name} ({user.role})</span>
                    <button onClick={onLogout} className="ml-4 bg-white/20 hover:bg-white/40 p-2 rounded text-xs uppercase flex items-center"><LogOut size={12} className="mr-1"/> Logout</button>
                </div>
            )}
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Navigation Banner */}
      <header className="bg-coop-dark text-white shadow-md sticky top-0 z-50 border-b border-coop-blue/30">
        <div className="container mx-auto">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex justify-center w-full">
            <div className="grid grid-flow-col auto-cols-max gap-0 w-full">
                {hasAccess('dashboard') && (
                    <NavButton 
                    active={activeTab === 'dashboard'} 
                    onClick={() => handleNavClick('dashboard')} 
                    icon={<LayoutDashboard size={20} />} 
                    label="Dashboard" 
                    />
                )}
                {hasAccess('proposals') && (
                    <NavButton 
                    active={activeTab === 'proposals'} 
                    onClick={() => handleNavClick('proposals')} 
                    icon={<ClipboardList size={20} />} 
                    label="Triage" 
                    />
                )}
                {hasAccess('facilitator') && (
                    <NavButton 
                    active={activeTab === 'facilitator'} 
                    onClick={() => handleNavClick('facilitator')} 
                    icon={<CalendarPlus size={20} />} 
                    label="Facilitator" 
                    />
                )}
                {hasAccess('catalog') && (
                    <NavButton 
                    active={activeTab === 'catalog'} 
                    onClick={() => handleNavClick('catalog')} 
                    icon={<BookOpen size={20} />} 
                    label="Catalogue" 
                    />
                )}
                {hasAccess('participant') && (
                    <NavButton 
                    active={activeTab === 'participant'} 
                    onClick={() => handleNavClick('participant')} 
                    icon={<UserCheck size={20} />} 
                    label="Participant" 
                    />
                )}
                {hasAccess('users') && (
                    <NavButton 
                    active={activeTab === 'users'} 
                    onClick={() => handleNavClick('users')} 
                    icon={<Users size={20} />} 
                    label="Users" 
                    />
                )}
            </div>
          </nav>

          {/* Mobile Navigation Header */}
          <div className="md:hidden flex justify-between items-center p-4">
            <span className="font-bold text-coop-blue text-[16pt]">CPD Navigation</span>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 hover:bg-white/10 rounded transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {isMobileMenuOpen && (
            <nav className="md:hidden bg-coop-dark border-t border-coop-blue/30 animate-in slide-in-from-top duration-300">
              <div className="flex flex-col">
                {hasAccess('dashboard') && (
                    <MobileNavButton 
                    active={activeTab === 'dashboard'} 
                    onClick={() => handleNavClick('dashboard')} 
                    icon={<LayoutDashboard size={20} />} 
                    label="Dashboard" 
                    />
                )}
                {hasAccess('proposals') && (
                    <MobileNavButton 
                    active={activeTab === 'proposals'} 
                    onClick={() => handleNavClick('proposals')} 
                    icon={<ClipboardList size={20} />} 
                    label="Triage" 
                    />
                )}
                {hasAccess('facilitator') && (
                    <MobileNavButton 
                    active={activeTab === 'facilitator'} 
                    onClick={() => handleNavClick('facilitator')} 
                    icon={<CalendarPlus size={20} />} 
                    label="Facilitator" 
                    />
                )}
                {hasAccess('catalog') && (
                    <MobileNavButton 
                    active={activeTab === 'catalog'} 
                    onClick={() => handleNavClick('catalog')} 
                    icon={<BookOpen size={20} />} 
                    label="Catalogue" 
                    />
                )}
                {hasAccess('participant') && (
                  <MobileNavButton 
                    active={activeTab === 'participant'} 
                    onClick={() => handleNavClick('participant')} 
                    icon={<UserCheck size={20} />} 
                    label="Participant" 
                  />
                )}
                 {hasAccess('users') && (
                  <MobileNavButton 
                    active={activeTab === 'users'} 
                    onClick={() => handleNavClick('users')} 
                    icon={<Users size={20} />} 
                    label="Users" 
                  />
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Floating Action Button for Chat */}
      <button 
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-coop-blue text-white p-4 rounded-full shadow-lg hover:bg-coop-dark hover:scale-110 active:scale-95 transition-all duration-300 z-50 flex items-center justify-center border-2 border-white group"
        aria-label="Open AI Assistant"
      >
        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Footer */}
      <footer className="bg-[#002240] text-white py-10 px-6 mt-20 flex-shrink-0 w-full">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
          {/* PDI Logo Wrapper */}
          <div className="w-full md:flex-1 flex justify-center md:justify-start">
            <a href="#" className="inline-block transition-transform">
              <img 
                src="https://i.ibb.co/kggsqQH4/Untitled-design-24.png" 
                alt="Professional Development Institute" 
                className="w-full max-w-[200px] sm:max-w-[280px] md:max-w-[350px] h-auto block" 
              />
            </a>
          </div>

          {/* Footer Text Wrapper */}
          <div className="w-full md:flex-1">
            <p className="text-[12pt] leading-relaxed">
              Co-op Academies Trust Professional Development Institute<br />
              One Angel Square, Manchester, M60 0AG, United Kingdom<br />
              Email: <a href="mailto:PDI@coopacademies.co.uk" className="hover:text-coop-blue transition-colors underline decoration-coop-blue/30">PDI@coopacademies.co.uk</a><br />
              Phone: 0161 413 3649 | Option 5<br />
              &copy;2026 Co-op Academies Trust
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex flex-col sm:flex-row items-center justify-center space-x-0 sm:space-x-3 py-4 px-6 flex-1 transition-all duration-300 relative group overflow-hidden ${
      active 
        ? 'bg-coop-blue text-white font-bold' 
        : 'text-gray-300 hover:text-white hover:bg-white/5'
    }`}
  >
    <span className={`absolute bottom-0 left-0 w-full h-1 bg-white transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}></span>
    <span className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
      {icon}
    </span>
    <span className="text-[16pt] mt-1 sm:mt-0 font-sans whitespace-nowrap">{label}</span>
  </button>
);

const MobileNavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-4 px-6 py-4 transition-all duration-300 border-b border-white/5 ${
      active 
        ? 'bg-coop-blue text-white font-bold' 
        : 'text-gray-300 hover:text-white hover:bg-white/5'
    }`}
  >
    <span className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
      {icon}
    </span>
    <span className="text-[16pt] font-sans">{label}</span>
  </button>
);

export default Layout;
