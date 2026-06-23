export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const MAP_TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ||
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const SATELLITE_TILE_URL =
  process.env.NEXT_PUBLIC_SATELLITE_TILE_URL ||
  "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";

export const DEFAULT_LAT = parseFloat(
  process.env.NEXT_PUBLIC_DEFAULT_LAT || "25.6"
);
export const DEFAULT_LNG = parseFloat(
  process.env.NEXT_PUBLIC_DEFAULT_LNG || "85.1"
);
export const DEFAULT_ZOOM = parseInt(
  process.env.NEXT_PUBLIC_DEFAULT_ZOOM || "8",
  10
);

export const BIHAR_DISTRICTS = [
  "Araria",
  "Arwal",
  "Aurangabad",
  "Banka",
  "Begusarai",
  "Bhagalpur",
  "Bhojpur",
  "Buxar",
  "Darbhanga",
  "East Champaran",
  "Gaya",
  "Gopalganj",
  "Jamui",
  "Jehanabad",
  "Kaimur",
  "Katihar",
  "Khagaria",
  "Kishanganj",
  "Lakhisarai",
  "Madhepura",
  "Madhubani",
  "Munger",
  "Muzaffarpur",
  "Nalanda",
  "Nawada",
  "Patna",
  "Purnia",
  "Rohtas",
  "Saharsa",
  "Samastipur",
  "Saran",
  "Sheikhpura",
  "Sheohar",
  "Sitamarhi",
  "Siwan",
  "Supaul",
  "Vaishali",
  "West Champaran",
];

export const GOVERNMENT_COLORS = {
  blue: "#1e3a5f",
  saffron: "#ff9933",
  green: "#138808",
  white: "#ffffff",
  gray: "#f5f5f5",
};

export const PARCEL_BOUNDARY_COLORS = {
  stroke: "#ff4444",
  fill: "rgba(255, 68, 68, 0.2)",
  highlightStroke: "#ff0000",
  highlightFill: "rgba(255, 0, 0, 0.3)",
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  parcel_pdf: "Parcel PDF",
  land_record: "Land Record",
  geojson: "GeoJSON",
  map_image: "Map Image",
  khasra: "Khasra",
  khatauni: "Khatauni",
};

export const NAV_LINKS = [
  { label: "Home", href: "/", public: true },
  { label: "Parcel Search", href: "/search", public: false },
  { label: "GIS Viewer", href: "/gis-viewer", public: false },
  { label: "Documents", href: "/documents", public: false },
  { label: "Help", href: "/help", public: true },
  { label: "Contact", href: "/contact", public: true },
];
