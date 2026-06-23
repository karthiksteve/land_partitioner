"use client";

import { useState } from "react";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Office Address",
      details: [
        "Department of Land Resources",
        "Government of India",
        "New Delhi - 110001",
        "India",
      ],
    },
    {
      icon: Phone,
      title: "Phone",
      details: ["+91-11-1234-5678", "+91-11-8765-4321 (Toll Free)"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["support@geokurra.gov.in", "info@geokurra.gov.in"],
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: [
        "Monday to Friday: 9:30 AM - 6:00 PM",
        "Saturday: 9:30 AM - 1:00 PM",
        "Closed on Public Holidays",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gov-gray">
      <GovHeader />

      <div className="max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="mb-8">
          <h1 className="gov-page-title">Contact Us</h1>
          <p className="gov-subtitle">
            Get in touch with the GeoKurra support team for assistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-4">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-gov-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gov-text-dark text-sm mb-1">
                        {item.title}
                      </h3>
                      {item.details.map((line, i) => (
                        <p
                          key={i}
                          className="text-sm text-gov-text-light"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-gov-saffron" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we will get back to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-gov-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-gov-text-dark mb-2">
                    Message Sent Successfully
                  </h3>
                  <p className="text-sm text-gov-text-light">
                    Thank you for contacting us. We will respond within 2-3
                    business days.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gov-text-dark mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gov-text-dark mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gov-text-dark mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gov-text-dark mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full rounded-md border border-gov-border bg-white px-3 py-2 text-sm text-gov-text-dark focus:outline-none focus:ring-2 focus:ring-gov-blue focus:border-gov-blue min-h-[120px] resize-y"
                      placeholder="Enter your message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" variant="saffron" size="lg" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <GovFooter />
    </div>
  );
}
