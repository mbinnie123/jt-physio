// app/contact/ContactForm.tsx
"use client";

import { useState, useTransition } from "react";
import { submitContact } from "./actions";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await submitContact(formData);
      if (result.success) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
        setErrorMessage(result.error || "An error occurred");
      }
    });
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-green-50 p-8 text-center border border-green-100 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-green-900">Message Sent!</h3>
        <p className="mt-2 text-green-700">
          Thanks for reaching out. We'll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-green-700 hover:text-green-800 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
            Full Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#1e3a8a] sm:text-sm sm:leading-6 transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-900">
            Phone Number
          </label>
          <div className="mt-2">
            <input
              type="tel"
              name="phone"
              id="phone"
              className="block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#1e3a8a] sm:text-sm sm:leading-6 transition-all"
              placeholder="07123 456789"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
          Email Address
        </label>
        <div className="mt-2">
          <input
            type="email"
            name="email"
            id="email"
            required
            className="block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#1e3a8a] sm:text-sm sm:leading-6 transition-all"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium leading-6 text-slate-900">
          How can we help?
        </label>
        <div className="mt-2">
          <textarea
            name="message"
            id="message"
            rows={4}
            required
            className="block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#1e3a8a] sm:text-sm sm:leading-6 resize-none transition-all"
            placeholder="Tell us about your injury or enquiry..."
          />
        </div>
      </div>

      {status === "error" && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-[#1e3a8a] px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}

