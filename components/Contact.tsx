"use client";

import React, { useState } from "react";
import { Twitter, Facebook, Youtube, Linkedin, Instagram, Github, Send, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";

export default function Contact() {
  const { data } = usePortfolio();
  const { contact } = data;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasOffice = Boolean(contact.office && contact.office.trim() !== "");
  const hasPhone = Boolean(contact.phone && contact.phone.trim() !== "");
  const hasEmail = Boolean(contact.email && contact.email.trim() !== "");
  const hasSocials = Boolean(
    contact.instagramUrl ||
    contact.twitterUrl ||
    contact.facebookUrl ||
    contact.youtubeUrl ||
    contact.linkedinUrl ||
    contact.githubUrl
  );

  const hasAnyLeftInfo = hasOffice || hasPhone || hasEmail || hasSocials;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsSending(true);

    try {
      if (contact.formspreeUrl && contact.formspreeUrl.trim() !== "") {
        const response = await fetch(contact.formspreeUrl.trim(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to send message via Formspree. Please check your form endpoint.");
        }
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message || "Failed to send email message.");
      } else {
        setErrorMessage("Failed to send email message.");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {contact.title && (
          <div className="mb-16">
            <h1 className="text-4xl font-extrabold text-dark">
              {contact.title}
            </h1>
          </div>
        )}

        <div className={`grid grid-cols-1 ${hasAnyLeftInfo ? "lg:grid-cols-12" : ""} gap-12`}>
          {/* Left Contact Info (Only renders non-empty items) */}
          {hasAnyLeftInfo && (
            <div className="lg:col-span-5 space-y-6">
              {hasOffice && (
                <>
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">My office:</p>
                    <h3 className="text-2xl font-bold text-dark">{contact.office}</h3>
                  </div>
                  <hr className="border-gray-200" />
                </>
              )}

              {hasPhone && (
                <>
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">Call me:</p>
                    <h3 className="text-2xl font-bold text-dark">{contact.phone}</h3>
                  </div>
                  <hr className="border-gray-200" />
                </>
              )}

              {hasEmail && (
                <>
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">Mail me:</p>
                    <h3 className="text-2xl font-bold text-dark">{contact.email}</h3>
                  </div>
                  <hr className="border-gray-200" />
                </>
              )}

              {hasSocials && (
                <div>
                  <p className="text-gray-500 font-semibold mb-3">Follow me:</p>
                  <div className="flex items-center space-x-3">
                    {contact.instagramUrl && (
                      <a
                        href={contact.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {contact.twitterUrl && (
                      <a
                        href={contact.twitterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {contact.facebookUrl && (
                      <a
                        href={contact.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                    {contact.youtubeUrl && (
                      <a
                        href={contact.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
                        aria-label="YouTube"
                      >
                        <Youtube size={20} />
                      </a>
                    )}
                    {contact.linkedinUrl && (
                      <a
                        href={contact.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin size={20} />
                      </a>
                    )}
                    {contact.githubUrl && (
                      <a
                        href={contact.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
                        aria-label="GitHub"
                      >
                        <Github size={20} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Contact Form */}
          <div className={`${hasAnyLeftInfo ? "lg:col-span-7" : "w-full"} bg-light p-8 rounded-2xl border border-gray-100 shadow-sm`}>
            {contact.description && (
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {contact.description}
              </p>
            )}

            {errorMessage && (
              <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center space-x-2">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-3">
                <CheckCircle size={28} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-lg">Thank You!</h5>
                  <p className="text-sm">Your message has been sent successfully. I will get back to you shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Project Inquiry"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Leave a message here..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-all duration-200 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
