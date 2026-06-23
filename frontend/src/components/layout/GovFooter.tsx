import Link from "next/link";

export default function GovFooter() {
  return (
    <footer className="bg-gov-blue text-white">
      {/* Tricolor divider */}
      <div className="h-1 w-full bg-gradient-to-r from-gov-saffron via-white to-gov-green" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Department info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gov-saffron flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <div>
                <h3 className="font-bold text-sm">GeoKurra</h3>
                <p className="text-xs text-blue-300">
                  Digital Land Information Portal
                </p>
              </div>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed">
              A Government of India initiative to provide access to cadastral
              records, parcel boundaries, and land information through Bihar
              BhuNaksha integration.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/search"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Parcel Search
                </Link>
              </li>
              <li>
                <Link
                  href="/gis-viewer"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  GIS Viewer
                </Link>
              </li>
              <li>
                <Link
                  href="/documents"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Documents
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Help & FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">
              Policies
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Copyright Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Accessibility Statement
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-6 pt-6 text-center">
          <p className="text-sm text-blue-300">
            Powered by{" "}
            <span className="text-gov-saffron font-medium">
              Bihar BhuNaksha
            </span>
          </p>
          <p className="text-xs text-blue-400 mt-2">
            &copy; {new Date().getFullYear()} GeoKurra | Department of Land
            Resources | Government of India
          </p>
        </div>
      </div>
    </footer>
  );
}
