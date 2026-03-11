import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    q: "How do I book an appointment?",
    a: "Go to Find Doctors, select a specialty, pick a doctor, and tap Book. Choose your preferred date and time slot.",
  },
  {
    q: "Are online consultations secure?",
    a: "Yes. All video calls are end-to-end encrypted and your medical data is stored securely following healthcare data standards.",
  },
  {
    q: "How do I get my prescription?",
    a: "After your consultation, your doctor will create a digital prescription. View it anytime from your Prescriptions page.",
  },
  {
    q: "Can I reschedule or cancel?",
    a: "Yes. Open your Appointments page, find the booking, and tap Reschedule or Cancel. Cancellations before 2 hours are fully refundable.",
  },
  {
    q: "How does billing work?",
    a: "You're charged the doctor's consultation fee at the time of booking. View all transactions on the Billing page.",
  },
  {
    q: "How do I make a donation?",
    a: "Tap the Donate tab in the bottom navigation. You can contribute to medical causes and track your donation history.",
  },
];

const HelpPage = () => {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-gradient-to-br from-primary to-blue-600 text-white px-5 pt-6 pb-8 rounded-b-3xl">
        <button onClick={() => navigate(-1)} className="mb-3 text-white/70">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Help & FAQ</h1>
        <p className="text-blue-100 text-sm mt-0.5">
          Find answers to common questions
        </p>
      </header>

      <main className="px-4 -mt-4 space-y-2">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <button
              key={i}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full text-left bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex items-center justify-between p-4">
                <span className="text-sm font-medium text-slate-900 pr-4">
                  {faq.q}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 fill-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                </svg>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                  {faq.a}
                </div>
              )}
            </button>
          );
        })}

        <div className="bg-white rounded-xl shadow-sm p-5 text-center mt-4">
          <p className="text-sm text-slate-600">Still need help?</p>
          <p className="text-xs text-slate-400 mt-1">
            Contact support at support@doctime.app
          </p>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;
