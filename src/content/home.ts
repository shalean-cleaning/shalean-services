export const hero = {
  title: "Book trusted cleaners in minutes",
  subtitle:
    "Professional cleaning services, trusted housekeepers, and reliable home care solutions.",
  ctas: [
    { label: "View Our Services", href: "/services", variant: "default" },
    { label: "Apply to Work", href: "/apply", variant: "ghost" },
  ],
  image: "/images/hero.svg",
};

export const services = [
  { icon: "broom", label: "Cleaning", href: "/services/cleaning" },
  { icon: "sparkles", label: "Deep Clean", href: "/services/deep-clean" },
  { icon: "leaf", label: "Outdoor", href: "/services/outdoor" },
  { icon: "shirt", label: "Laundry/Ironing", href: "/services/laundry" },
  { icon: "baby", label: "Nanny", href: "/services/nanny" },
  { icon: "heart", label: "Elder Care", href: "/services/elder-care" },
  { icon: "truck", label: "Move-In/Out", href: "/services/move-in-out" },
  { icon: "home", label: "Airbnb", href: "/services/airbnb" },
];

export const serviceIconMap = {
  Cleaning:        { icon: "Broom",          fg: "text-blue-600",   bg: "bg-blue-50",     ring: "ring-blue-100" },
  "Deep Clean":    { icon: "Sparkles",       fg: "text-purple-600", bg: "bg-purple-50",   ring: "ring-purple-100" },
  Outdoor:         { icon: "Leaf",           fg: "text-emerald-600",bg: "bg-emerald-50",  ring: "ring-emerald-100" },
  "Laundry/Ironing":{ icon: "Shirt",         fg: "text-sky-600",    bg: "bg-sky-50",      ring: "ring-sky-100" },
  Nanny:           { icon: "Baby",           fg: "text-pink-600",   bg: "bg-pink-50",     ring: "ring-pink-100" },
  "Elder Care":    { icon: "HeartHandshake", fg: "text-rose-600",   bg: "bg-rose-50",     ring: "ring-rose-100" },
  "Move-In/Out":   { icon: "Truck",          fg: "text-amber-600",  bg: "bg-amber-50",    ring: "ring-amber-100" },
  Airbnb:          { icon: "Home",           fg: "text-teal-600",   bg: "bg-teal-50",     ring: "ring-teal-100" },
} as const;

export const features = [
  { title: "Bookings", text: "Schedule one-time or recurring cleaning." },
  { title: "Placements", text: "Find full-time housekeepers, nannies, carers." },
  { title: "MyHome Hub", text: "Manage all services and bookings in one place." },
];

export const safety = [
  { title: "Background Checks", text: "Comprehensive verification." },
  { title: "References", text: "Verified references." },
  { title: "Years Experience", text: "Minimum 2+ years." },
  { title: "Insurance Coverage", text: "Fully insured and bonded." },
];

export const partners = [
  "Airbnb", "Booking.com", "Property24", "Private Property", "Gumtree", "OLX"
];

export const team = [
  { name: "Sarah Johnson", role: "Admin", img: "/images/avatar.svg" },
  { name: "Mike Chen", role: "Admin", img: "/images/avatar.svg" },
  { name: "Emma Rodriguez", role: "Admin", img: "/images/avatar.svg" },
];
