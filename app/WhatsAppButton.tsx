"use client";

import { useState } from "react";

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const phoneNumber = "447841430205"; // TODO: Replace with Jordan's actual WhatsApp number
    const text = message.trim() ? message : "Hi, I'm interested in booking an appointment.";
    const encodedMessage = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 origin-bottom-right transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-[#1e3a8a] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                JT
              </div>
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#1e3a8a]" />
            </div>
            <div>
              <h3 className="font-bold text-base">Chat with Jordan</h3>
              <p className="text-xs text-blue-100">Typically replies in 1 hour</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 bg-slate-50">
          <div className="mb-4 rounded-tl-xl rounded-tr-xl rounded-br-xl bg-white p-3 shadow-sm border border-slate-100 text-sm text-slate-600">
            <p>Hi there! 👋 <br/>How can we help you with your recovery today?</p>
          </div>
          
          <div className="relative">
            <textarea
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] resize-none bg-white"
              rows={3}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            onClick={handleSend}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#20bd5a] hover:shadow-lg active:scale-95"
          >
            <img src="/whatsapp-icon.svg" alt="WhatsApp" className="h-5 w-5" />
            Start Chat
          </button>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none ${
          isOpen ? "bg-slate-800 rotate-90" : "bg-[#1e3a8a] rotate-0"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <img src="/whatsapp-icon.svg" alt="WhatsApp" className="h-8 w-8" />
        )}
      </button>
    </>
  );
}