"use client";

import Link from "next/link";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, MapPin, FileText, Globe, ChevronRight } from "lucide-react";
import { BIHAR_DISTRICTS } from "@/lib/constants";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [searchDistrict, setSearchDistrict] = useState("");
  const [searchPlot, setSearchPlot] = useState("");

  const districtOptions = BIHAR_DISTRICTS.map((d) => ({
    value: d,
    label: d,
  }));

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchDistrict) params.set("district", searchDistrict);
    if (searchPlot) params.set("plot_number", searchPlot);
    router.push(`/search?${params.toString()}`);
  };

  const features = [
    {
      icon: Search,
      title: "Parcel Search",
      description:
        "Search land records by district, circle, mouza, and plot number. Access detailed parcel information from Bihar BhuNaksha.",
      link: "/search",
      color: "text-gov-blue",
      bgColor: "bg-blue-50",
    },
    {
      icon: MapPin,
      title: "GIS Viewer",
      description:
        "View parcels on satellite imagery with interactive maps. Explore parcel boundaries and geographical context.",
      link: "/gis-viewer",
      color: "text-gov-green",
      bgColor: "bg-green-50",
    },
    {
      icon: FileText,
      title: "Document Download",
      description:
        "Download land records, parcel PDFs, and GeoJSON files. Access official documents for your land records.",
      link: "/documents",
      color: "text-gov-saffron",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gov-gray">
      <GovHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gov-blue to-gov-blue-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-gov-saffron" />
                <span className="text-sm text-gov-saffron font-medium uppercase tracking-wider">
                  Government of India Initiative
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Digital Land Information Portal
              </h1>
              <p className="text-lg text-blue-200 mb-8 leading-relaxed">
                Access cadastral records, parcel boundaries, and land information
                from Bihar BhuNaksha. A comprehensive platform for citizens and
                government officers.
              </p>

              {/* Quick Search */}
              <form
                onSubmit={handleQuickSearch}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
              >
                <p className="text-sm font-medium mb-3">
                  Quick Parcel Search
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    options={districtOptions}
                    placeholder="Select District"
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className="bg-white/90 text-gov-text-dark"
                  />
                  <Input
                    placeholder="Plot Number"
                    value={searchPlot}
                    onChange={(e) => setSearchPlot(e.target.value)}
                    className="bg-white/90 text-gov-text-dark"
                  />
                  <Button type="submit" variant="saffron" size="default">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full bg-gov-saffron/20 animate-pulse" />
                <div className="absolute inset-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Globe className="h-24 w-24 text-gov-saffron" />
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 bg-gov-green/30 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-gov-green" />
                </div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-gov-saffron/30 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-gov-saffron" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gov-text-dark mb-3">
              Portal Features
            </h2>
            <p className="text-gov-text-light max-w-2xl mx-auto">
              Comprehensive tools for land record management and exploration
            </p>
            <div className="w-20 h-1 bg-gov-saffron mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.link}
                  className="group block"
                >
                  <div className="gov-card p-6 h-full transition-shadow hover:shadow-gov-lg">
                    <div
                      className={`w-14 h-14 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                    >
                      <Icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gov-text-dark mb-2 group-hover:text-gov-blue transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gov-text-light leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-1 mt-4 text-sm text-gov-blue font-medium">
                      <span>Learn more</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gov-gray">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gov-blue">38</div>
              <div className="text-sm text-gov-text-light mt-1">Districts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gov-green">500+</div>
              <div className="text-sm text-gov-text-light mt-1">Circles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gov-saffron">45,000+</div>
              <div className="text-sm text-gov-text-light mt-1">Villages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gov-blue">Millions</div>
              <div className="text-sm text-gov-text-light mt-1">Parcels</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gov-text-dark mb-3">
              How to Search Land Records
            </h2>
            <p className="text-gov-text-light max-w-2xl mx-auto">
              Simple steps to access land information
            </p>
            <div className="w-20 h-1 bg-gov-saffron mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Select District",
                desc: "Choose a district from Bihar",
              },
              {
                step: "2",
                title: "Enter Details",
                desc: "Fill circle, mouza, and plot number",
              },
              {
                step: "3",
                title: "Search Parcel",
                desc: "Click search to find your parcel",
              },
              {
                step: "4",
                title: "View & Download",
                desc: "View on map and download documents",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gov-blue text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gov-text-dark mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gov-text-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gov-blue to-gov-blue-dark text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Access Land Records Today
          </h2>
          <p className="text-blue-200 max-w-2xl mx-auto mb-8">
            Register for an account to access detailed parcel information, GIS
            maps, and downloadable documents.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button variant="saffron" size="lg">
                Register Now
              </Button>
            </Link>
            <Link href="/search">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white/50 hover:bg-white/10"
              >
                Try Parcel Search
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <GovFooter />
    </div>
  );
}
