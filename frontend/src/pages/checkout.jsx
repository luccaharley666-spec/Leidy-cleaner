import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import CheckoutForm from '../components/Payments/CheckoutForm';
import LoyaltyPanel from '../components/Loyalty/LoyaltyPanel';
import dynamic from 'next/dynamic';

const PushManager = dynamic(() => import('../components/Notifications/PushManager'), { ssr: false });

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <CheckoutForm />
          </div>
          <div className="card">
            <LoyaltyPanel />
          </div>
        </div>
        <div className="mt-4">
          <PushManager />
        </div>
      </main>
      <Footer />
    </div>
  );
}
