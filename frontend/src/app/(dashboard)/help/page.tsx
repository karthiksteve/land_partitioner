"use client";

import { useState } from "react";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight, HelpCircle, FileText, MapPin, Phone, Search } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is GeoKurra?",
    answer:
      "GeoKurra is a Digital Land Information Portal that provides access to cadastral records, parcel boundaries, and land information from Bihar BhuNaksha. It is a Government of India initiative to make land records easily accessible to citizens and government officers.",
  },
  {
    question: "How do I search for a land parcel?",
    answer:
      "To search for a land parcel, navigate to the Parcel Search page, select a district from the dropdown, enter the plot number, and optionally provide circle and mouza information. Click 'Search Parcel' to retrieve the land records from Bihar BhuNaksha.",
  },
  {
    question: "What is PNIU?",
    answer:
      "PNIU stands for Parcel Numbering and Indexing Unit. It is a unique identifier assigned to each land parcel in the system. The PNIU helps in uniquely identifying and referencing parcels across the state.",
  },
  {
    question: "What documents can I download?",
    answer:
      "You can download various documents including Parcel PDF (cadastral map), Land Record (ownership details), GeoJSON (boundary data for GIS), and Map Image (satellite view screenshot).",
  },
  {
    question: "Is the information accurate and official?",
    answer:
      "The information displayed on GeoKurra is sourced from Bihar BhuNaksha, the official government land records system. However, for official purposes, you should verify the records at the respective circle office.",
  },
  {
    question: "How do I view a parcel on the map?",
    answer:
      "After searching for a parcel, click on 'View on GIS Map' button in the search results. This will open the parcel boundary overlay on satellite imagery. You can also use the GIS Viewer for a full-screen map experience.",
  },
  {
    question: "Can I access GeoKurra on mobile?",
    answer:
      "Yes, GeoKurra is designed to be responsive and accessible on mobile devices, tablets, and desktop computers.",
  },
  {
    question: "Who can use GeoKurra?",
    answer:
      "GeoKurra is available for all citizens and government officers. Citizens can search and view land records, while officers may have additional privileges for data management.",
  },
];

const sections = [
  {
    icon: Search,
    title: "How to Search Parcels",
    content: [
      "Navigate to the Parcel Search page from the main menu.",
      "Select a district from the dropdown list (e.g., Patna, Gaya, Nalanda).",
      "Enter the Circle name (optional but recommended for better results).",
      "Enter the Mouza/Village name (optional).",
      "Enter the Plot Number (required field).",
      "Click the 'Search Parcel' button.",
      "View the search results with parcel details and GIS map.",
    ],
  },
  {
    icon: MapPin,
    title: "Understanding PNIU",
    content: [
      "PNIU (Parcel Numbering and Indexing Unit) is a unique identifier for each land parcel.",
      "It is a combination of district, circle, mouza, and plot identifiers.",
      "The PNIU is used across the system for referencing parcels.",
      "You can search and find parcels using their PNIU.",
      "The PNIU is displayed prominently in parcel details.",
    ],
  },
  {
    icon: FileText,
    title: "Reading Land Records",
    content: [
      "Land records contain ownership details, area measurements, and parcel boundaries.",
      "The Khata number identifies the account/ledger entry for the parcel.",
      "Area is shown in both acres and hectares.",
      "Owner name and father's name indicate the current recorded owner.",
      "Land type describes the classification of the land (e.g., agricultural, residential).",
    ],
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border border-gov-border rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-gov-gray transition-colors"
          >
            <span className="text-sm font-medium text-gov-text-dark">
              {faq.question}
            </span>
            {openIndex === index ? (
              <ChevronDown className="h-4 w-4 text-gov-text-light" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gov-text-light" />
            )}
          </button>
          {openIndex === index && (
            <div className="px-4 py-3 bg-gov-gray border-t border-gov-border">
              <p className="text-sm text-gov-text-light leading-relaxed">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gov-gray">
      <GovHeader />

      <div className="max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="mb-8">
          <h1 className="gov-page-title">Help & Support</h1>
          <p className="gov-subtitle">
            Learn how to use GeoKurra to search land records and access parcel
            information
          </p>
        </div>

        {/* Guide Sections */}
        <div className="space-y-6 mb-10">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-gov-saffron" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2">
                    {section.content.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-gov-text-dark leading-relaxed"
                      >
                        {item}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-gov-saffron" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about GeoKurra and land records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FAQSection />
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="mt-6 bg-gov-blue text-white">
          <CardContent className="py-6 text-center">
            <Phone className="h-8 w-8 mx-auto mb-3 text-gov-saffron" />
            <h3 className="text-lg font-semibold mb-2">
              Still have questions?
            </h3>
            <p className="text-blue-200 text-sm mb-4">
              Contact our support team for assistance
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-4 py-2 bg-gov-saffron text-white rounded-md text-sm font-medium hover:bg-gov-saffron-dark"
            >
              Contact Us
            </a>
          </CardContent>
        </Card>
      </div>

      <GovFooter />
    </div>
  );
}
