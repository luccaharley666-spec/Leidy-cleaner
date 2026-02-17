import React, { useState } from 'react';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
// import ChatComponent from '../../components/Common/ChatComponent';

export default function Chat() {
  const [bookingId] = useState('booking_001');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">💬 Chat do Agendamento</h1>
          {/* ChatComponent desabilitado temporariamente */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
