
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import Success from './pages/Success';
import BillingSuccess from './pages/BillingSuccess';

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

const App: React.FC = () => {
  useEffect(() => {
    if (window.Paddle) {
      window.Paddle.Initialize({
        token: 'live_c93653afe91caaa9f5ad6a0d4da'
      });
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/success" element={<Success />} />
          <Route path="/billing/success" element={<BillingSuccess />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
