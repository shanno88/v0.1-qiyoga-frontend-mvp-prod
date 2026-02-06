
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Mail, Globe, Cpu } from 'lucide-react';

declare global {
  interface Window {
    Paddle: {
      Initialize: (options: { token: string }) => void;
      Checkout: {
        open: (options: { items: { priceId: string; quantity: number }[] }) => void;
      };
    };
  }
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handlePaymentClick = () => {
    window.Paddle.Checkout.open({
      items: [{ priceId: 'pri_01kgrhp2wrthebpgwmn8eh5ssy', quantity: 1 }]
    });
  };

  const handleNavClick = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Cpu className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                  QiYoga Studio
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => handleNavClick('how-it-works')} className="text-slate-600 hover:text-indigo-600 transition-colors font-medium cursor-pointer">How it works</button>
              <button onClick={() => handleNavClick('demo')} className="text-slate-600 hover:text-indigo-600 transition-colors font-medium cursor-pointer">AI Demo</button>
              <button onClick={() => handleNavClick('pricing')} className="text-slate-600 hover:text-indigo-600 transition-colors font-medium cursor-pointer">Pricing</button>
              <button onClick={() => handleNavClick('contact')} className="text-slate-600 hover:text-indigo-600 transition-colors font-medium cursor-pointer">Contact</button>
              <button 
                onClick={handlePaymentClick}
                className="bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                Get My Lease Reviewed
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Cpu className="h-6 w-6 text-indigo-600" />
                <span className="text-lg font-bold">QiYoga Studio</span>
              </div>
              <p className="text-slate-500 max-w-sm mb-4">
                Professional online lease consulting for U.S. tenants. We provide plain-English explanations of complex rental agreements.
              </p>
              <p className="text-sm font-semibold text-indigo-600 mb-2">14-day refund policy. support@qiyoga.vip</p>
              <p className="text-xs text-slate-400">
                Digital consulting services only. No physical goods or in-person services. Registered domain: qiyoga.xyz
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => handleNavClick('how-it-works')} className="text-slate-600 hover:text-indigo-600 text-sm cursor-pointer block text-left w-full">How it works</button></li>
                <li><button onClick={() => handleNavClick('demo')} className="text-slate-600 hover:text-indigo-600 text-sm cursor-pointer block text-left w-full">AI Demo</button></li>
                <li><button onClick={() => handleNavClick('pricing')} className="text-slate-600 hover:text-indigo-600 text-sm cursor-pointer block text-left w-full">Pricing</button></li>
                <li><button onClick={() => handleNavClick('contact')} className="text-slate-600 hover:text-indigo-600 text-sm cursor-pointer block text-left w-full">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-slate-600 hover:text-indigo-600 text-sm">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-slate-600 hover:text-indigo-600 text-sm">Privacy Policy</Link></li>
                <li><Link to="/refund" className="text-slate-600 hover:text-indigo-600 text-sm">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <p>&copy; 2025 QiYoga Studio. All rights reserved.</p>
            <div className="mt-2 md:mt-0 flex items-center space-x-4">
              <span className="flex items-center">
                <Shield className="h-3 w-3 mr-1" /> Payments processed securely by Paddle.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
