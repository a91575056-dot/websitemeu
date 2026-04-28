export type IconKey =
  | "layout"
  | "business"
  | "mobile"
  | "redesign"
  | "onepage"
  | "conversion"
  | "seo"
  | "whatsapp"
  | "fast"
  | "modern"
  | "affordable"
  | "experience"
  | "communication"
  | "brief"
  | "design"
  | "develop"
  | "review"
  | "launch";

export type Project = {
  slug: string;
  category: string;
  title: string;
  tagline: string;
  description: string;
  audience: string;
  challenge: string;
  solution: string;
  result: string;
  timeline: string;
  priceLabel: string;
  accent: string;
  desktopImage: string;
  mobileImage: string;
  metrics: string[];
  deliverables: string[];
  industries: string[];
  seoTitle: string;
  seoDescription: string;
};

export const siteConfig = {
  name: "Dionis Web",
  personName: "Dionis Grecu",
  role: "Freelance Web Developer",
  siteUrl: "https://dionisweb.com",
  email: "dioniswebstudio@gmail.com",
  location: "Based in Europe, available worldwide",
  whatsappNumber: "37360000000",
  whatsappDirectLink: "https://wa.me/message/SG2JWLAO726VK1",
  whatsappDefaultMessage:
    "Hi Dionis, I would like a website or landing page quote.",
  title:
    "Dionis Grecu | Dionis Web - Landing Page & Business Website Design",
  description:
    "Dionis Grecu, the freelance web developer behind Dionis Web, creates fast, mobile-first landing pages and business websites for small brands, creators, and local companies. Packages start from $40.",
  shortDescription:
    "Modern websites and landing pages by Dionis Grecu for small businesses, creators, and personal brands.",
  heroHeadline: "Premium websites that look established from day one.",
  heroSubheadline:
    "I design and build clean, modern websites and landing pages for small businesses, creators, and local brands, with focused launch packages starting from $40.",
  trustMicrocopy:
    "Direct communication, fast turnaround, mobile-first layouts, and clear pricing.",
  showPortfolio: false,
  portfolioHref: "/portfolio",
  navItems: [
    { label: "Services", href: "/#services" },
    { label: "Work", href: "/#portfolio" },
    { label: "About", href: "/#about" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Payment", href: "/#payment" },
    { label: "FAQ", href: "/#faq" },
    { label: "Portfolio", href: "/portfolio" },
  ],
  socials: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/dionis.grecu?igsh=MW85eWY4bzZnaGdsbA%3D%3D&utm_source=qr",
    },
    { label: "TikTok", href: "https://www.tiktok.com/@dionisweb" },
    { label: "Fiverr", href: "https://www.fiverr.com/s/ak6qm9Q" },
  ],
  alternateNames: [
    "Dionis Grecu",
    "Dionis Web",
    "DionisWeb",
    "dionisweb",
    "Dionis landing page",
    "Dionis web designer",
    "Dionis web developer",
  ],
  keywords: [
    "Dionis Grecu",
    "Dionis Web",
    "DionisWeb",
    "dionisweb",
    "Dionis Grecu web developer",
    "Dionis Grecu web designer",
    "Dionis Grecu landing page designer",
    "Dionis Web landing pages",
    "Dionis landing page",
    "Dionis web designer",
    "Dionis web developer",
    "dionis landing page",
    "dionis website designer",
    "dionis freelance web developer",
    "freelance web designer",
    "freelance web developer",
    "landing page designer",
    "landing page developer",
    "affordable website design",
    "business website creator",
    "business website developer",
    "mobile-friendly websites",
    "mobile-first web design",
    "fast website design",
    "website design from $40",
    "landing pages for small businesses",
    "small business website design",
    "creator website design",
    "personal brand website design",
    "restaurant website design",
    "local business website design",
    "website redesign service",
    "conversion-focused landing page",
    "WhatsApp website integration",
    "SEO-friendly website design",
    "Europe freelance web designer",
    "worldwide freelance web designer",
  ],
};

export function getWhatsAppLink(message = siteConfig.whatsappDefaultMessage) {
  void message;
  return siteConfig.whatsappDirectLink;
}

export const heroMetrics = [
  { value: "1-3 days", label: "Delivery time" },
  { value: "$40+", label: "Launch-ready packages" },
  { value: "100%", label: "Mobile-first builds" },
];

export const trustPoints = [
  "Perfect for small businesses, freelancers, personal brands, and creators.",
  "Conversion-focused sections designed to turn visitors into inquiries.",
  "Clear communication through WhatsApp from first message to launch.",
];

export const services = [
  {
    title: "Landing Page Design",
    description:
      "High-converting one-page launches for offers, events, products, and lead generation.",
    icon: "layout" as const,
  },
  {
    title: "Business Website Design",
    description:
      "Clean multi-section sites that help local businesses and service brands look established.",
    icon: "business" as const,
  },
  {
    title: "Mobile-First Web Design",
    description:
      "Interfaces built for thumb-friendly navigation, fast loading, and polished tablet layouts.",
    icon: "mobile" as const,
  },
  {
    title: "Website Redesign",
    description:
      "Modern refreshes for outdated websites that need stronger trust, clarity, and conversions.",
    icon: "redesign" as const,
  },
  {
    title: "Fast One-Page Websites",
    description:
      "Lean, strategic websites for businesses that need to launch quickly without sacrificing quality.",
    icon: "onepage" as const,
  },
  {
    title: "Conversion-Focused UI",
    description:
      "Structured layouts, stronger calls to action, and visual hierarchy that supports real inquiries.",
    icon: "conversion" as const,
  },
  {
    title: "Basic SEO Optimization",
    description:
      "Metadata, semantic structure, keyword-aware copy, and performance-minded setup from the start.",
    icon: "seo" as const,
  },
  {
    title: "WhatsApp Integration",
    description:
      "Sticky buttons, direct lead paths, and contact flows that make it easy to start conversations.",
    icon: "whatsapp" as const,
  },
];

export const reasons = [
  {
    title: "Delivery in 1-3 days",
    description:
      "Focused workflows help you launch quickly, especially for landing pages and lean business sites.",
    icon: "fast" as const,
  },
  {
    title: "Modern visual direction",
    description:
      "Layouts feel current, premium, and clean without becoming cluttered or generic.",
    icon: "modern" as const,
  },
  {
    title: "Affordable entry point",
    description:
      "Packages starting from $40 make it easier to launch professionally, then scale over time.",
    icon: "affordable" as const,
  },
  {
    title: "Speed and UX focused",
    description:
      "Responsive structure, clean code, and lightweight motion keep the experience sharp on every device.",
    icon: "experience" as const,
  },
  {
    title: "Direct communication",
    description:
      "You work directly with the designer, with quick feedback and simple collaboration through WhatsApp.",
    icon: "communication" as const,
  },
];

export const portfolioProjects: Project[] = [
  {
    slug: "launchflow-coach",
    category: "Landing Page",
    title: "LaunchFlow Coach",
    tagline: "A focused conversion page for a personal brand offer launch.",
    description:
      "Premium landing page concept for a business coach offering a signature growth program.",
    audience: "Creators and personal brands",
    challenge:
      "The client needed a fast, premium-looking page that explained the offer clearly and pushed more discovery calls.",
    solution:
      "I designed a clean storytelling layout with a strong hero, proof blocks, and a friction-free WhatsApp inquiry path.",
    result:
      "The final concept feels established, direct, and ready to convert high-intent visitors on both mobile and desktop.",
    timeline: "3 days",
    priceLabel: "From $40",
    accent: "#0f766e",
    desktopImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    mobileImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    metrics: ["Clear offer stack", "Direct booking flow", "Mobile conversion"],
    deliverables: ["Landing page", "Offer sections", "WhatsApp CTA", "Basic SEO"],
    industries: ["Coach", "Creator", "Personal brand"],
    seoTitle:
      "LaunchFlow Coach Project | Landing Page Design for Personal Brands",
    seoDescription:
      "A premium landing page concept for a coach and personal brand, built for clarity, trust, and WhatsApp inquiries.",
  },
  {
    slug: "harbor-dental",
    category: "Business Website",
    title: "Harbor Dental Studio",
    tagline: "A calm, modern website for a local service business.",
    description:
      "Business website concept for a dental clinic that needed better trust signals and easier mobile navigation.",
    audience: "Local businesses and clinics",
    challenge:
      "The old website felt outdated, confusing, and weak on mobile, which reduced confidence for new patients.",
    solution:
      "I rebuilt the structure around services, trust, testimonials, and fast contact actions with a polished local-business look.",
    result:
      "The refreshed direction feels clean, professional, and easy to use for people booking from their phones.",
    timeline: "5 days",
    priceLabel: "From $40",
    accent: "#1d4ed8",
    desktopImage:
      "https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1400&q=80",
    mobileImage:
      "https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=900&q=80",
    metrics: ["Trust-first layout", "Service clarity", "Easy contact path"],
    deliverables: [
      "Business website",
      "Service overview",
      "Mobile redesign",
      "Local SEO setup",
    ],
    industries: ["Dental", "Healthcare", "Local business"],
    seoTitle:
      "Harbor Dental Studio Project | Local Business Website Redesign",
    seoDescription:
      "A premium local-business website concept with strong trust elements, mobile-first design, and fast contact flow.",
  },
  {
    slug: "luna-skin-lab",
    category: "Product Promo",
    title: "Luna Skin Lab",
    tagline: "A polished product-focused page for a modern beauty brand.",
    description:
      "High-end promo page concept for a skincare label featuring bundles, ingredient highlights, and launch messaging.",
    audience: "Beauty and skincare brands",
    challenge:
      "The brand needed a premium digital presence that felt elegant enough for paid traffic and influencer referrals.",
    solution:
      "I paired soft visuals with stronger product hierarchy, benefit-led copy blocks, and streamlined mobile sections.",
    result:
      "The concept gives the brand a more elevated first impression while staying lightweight and conversion-focused.",
    timeline: "4 days",
    priceLabel: "From $40",
    accent: "#be6d45",
    desktopImage:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80",
    mobileImage:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    metrics: ["Luxury feel", "Product storytelling", "Mobile-ready promo"],
    deliverables: ["Promo page", "Product modules", "CTA strategy", "Speed polish"],
    industries: ["Beauty", "Skincare", "Ecommerce promo"],
    seoTitle:
      "Luna Skin Lab Project | Beauty and Skincare Promo Page Design",
    seoDescription:
      "A product promo page with premium visuals, conversion-focused sections, and lightweight mobile performance.",
  },
  {
    slug: "ember-bistro",
    category: "Restaurant",
    title: "Ember Bistro",
    tagline: "A warm restaurant site built to drive reservations and trust.",
    description:
      "Restaurant website concept designed to make menus, atmosphere, and booking actions feel premium and effortless.",
    audience: "Restaurants and hospitality brands",
    challenge:
      "The restaurant needed a modern site that matched the in-person dining experience and worked well for mobile visitors.",
    solution:
      "I designed a rich homepage with elegant imagery, menu previews, social proof, and simple contact actions.",
    result:
      "The final direction makes the brand feel more upscale while keeping information easy to scan on smaller screens.",
    timeline: "5 days",
    priceLabel: "From $40",
    accent: "#b45309",
    desktopImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
    mobileImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    metrics: ["Reservation-focused", "Warm branding", "Menu highlights"],
    deliverables: ["Restaurant website", "Hero storytelling", "Reservation CTA", "Photo-led design"],
    industries: ["Restaurant", "Cafe", "Hospitality"],
    seoTitle: "Ember Bistro Project | Restaurant Website Design Showcase",
    seoDescription:
      "A premium restaurant website concept with elegant visuals, mobile-first layout, and clear reservation calls to action.",
  },
  {
    slug: "northshore-services",
    category: "Services Website",
    title: "Northshore Services",
    tagline: "A clean, high-trust website for a home services brand.",
    description:
      "Service business website concept for plumbing, repairs, and maintenance with strong local-business credibility.",
    audience: "Trades and local service companies",
    challenge:
      "The business needed to look more reliable online and make it easier for visitors to request help quickly.",
    solution:
      "I used bold contact zones, service cards, reassuring proof points, and a straightforward mobile-first structure.",
    result:
      "The new concept feels dependable, fast, and much more aligned with how service businesses win inquiries today.",
    timeline: "4 days",
    priceLabel: "From $40",
    accent: "#0f766e",
    desktopImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
    mobileImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
    metrics: ["Fast inquiry flow", "High-trust sections", "Local-business clarity"],
    deliverables: ["Service website", "Quote CTA", "Responsive redesign", "WhatsApp button"],
    industries: ["Home services", "Trades", "Local business"],
    seoTitle:
      "Northshore Services Project | Service Business Website Design",
    seoDescription:
      "A clean service-business website built for credibility, mobile usability, and direct inquiries through WhatsApp.",
  },
  {
    slug: "atelier-solo",
    category: "Personal Brand",
    title: "Atelier Solo",
    tagline: "A refined portfolio site for a creative founder.",
    description:
      "Personal brand website concept balancing authority, story, portfolio highlights, and a direct inquiry path.",
    audience: "Freelancers, founders, and personal brands",
    challenge:
      "The founder wanted a site that felt more premium than a template while staying simple enough to manage and scale.",
    solution:
      "I built a modern narrative layout with polished visuals, focused copy, and a deliberate CTA rhythm across the page.",
    result:
      "The brand now feels more intentional and premium, with a stronger foundation for services, content, and collaborations.",
    timeline: "4 days",
    priceLabel: "From $40",
    accent: "#7c3aed",
    desktopImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    mobileImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    metrics: ["Personal positioning", "Premium storytelling", "Flexible content"],
    deliverables: ["Portfolio website", "About story", "Project highlights", "Contact journey"],
    industries: ["Creative", "Freelancer", "Founder"],
    seoTitle: "Atelier Solo Project | Personal Brand Portfolio Website",
    seoDescription:
      "A premium personal-brand portfolio website with storytelling structure, modern visuals, and conversion-focused calls to action.",
  },
];

export const aboutHighlights = [
  "Clean, premium layouts designed to build trust quickly.",
  "Fast-loading experiences with mobile-first structure and lightweight code.",
  "Simple collaboration for businesses that want a strong website without a complicated process.",
];

export const processSteps = [
  {
    title: "Brief / idea",
    description:
      "We define your goal, style, audience, and the exact action you want visitors to take.",
    icon: "brief" as const,
  },
  {
    title: "Design",
    description:
      "I shape the structure, copy flow, and visual direction so the website feels clear and premium.",
    icon: "design" as const,
  },
  {
    title: "Development",
    description:
      "The design becomes a fast, responsive website with clean code and mobile-friendly interactions.",
    icon: "develop" as const,
  },
  {
    title: "Review",
    description:
      "You review the draft, send feedback, and we refine the details until everything feels right.",
    icon: "review" as const,
  },
  {
    title: "Launch",
    description:
      "Your website goes live with performance, SEO basics, and contact paths ready to work.",
    icon: "launch" as const,
  },
];

export const pricing = [
  {
    title: "Landing Page",
    price: "From $40",
    description:
      "Best for launches, offers, promotions, and lean lead-generation pages.",
    features: [
      "One premium page",
      "Mobile-first layout",
      "WhatsApp CTA setup",
      "Basic SEO structure",
    ],
  },
  {
    title: "Business Website",
    price: "From $40",
    description:
      "Great for local businesses and freelancers who need a polished web presence fast.",
    features: [
      "Multi-section website",
      "Responsive across devices",
      "Service and trust sections",
      "Fast contact experience",
    ],
    featured: true,
  },
  {
    title: "Custom Project",
    price: "Custom quote",
    description:
      "For redesigns, more pages, advanced sections, or a tailored visual direction.",
    features: [
      "Flexible scope",
      "Custom content flow",
      "Portfolio or service focus",
      "Scalable foundation",
    ],
  },
];

export const testimonials = [
  {
    quote:
      "The site looked far more premium than the price suggested. It gave my business instant credibility.",
    author: "Mira T.",
    role: "Beauty studio owner",
  },
  {
    quote:
      "Fast communication, clean design, and the mobile version felt incredibly polished. Clients started messaging right away.",
    author: "Daniel R.",
    role: "Personal brand coach",
  },
  {
    quote:
      "I needed something modern and simple for my local business. The final result felt professional and easy to trust.",
    author: "Elena S.",
    role: "Restaurant manager",
  },
];

export const faqs = [
  {
    question: "How long does it take?",
    answer:
      "Simple landing pages can move quickly, often within a few days depending on content and feedback. Larger or more custom websites take longer, but the process stays clear and focused.",
  },
  {
    question: "What do I need to get started?",
    answer:
      "A short description of your business, the service or offer you want to promote, any logo or brand colors you already use, and examples of websites you like if you have them.",
  },
  {
    question: "Do you make mobile-friendly websites?",
    answer:
      "Yes. Every project is designed mobile-first, then refined for tablets and desktops so the site feels polished on every screen size.",
  },
  {
    question: "Can you redesign my existing website?",
    answer:
      "Yes. If your current site feels outdated, confusing, or weak on mobile, I can redesign it with a cleaner structure and better conversion flow.",
  },
  {
    question: "Do you add WhatsApp contact buttons?",
    answer:
      "Yes. WhatsApp can be added as a sticky button, a hero CTA, and a contact option in pricing or final CTA sections.",
  },
  {
    question: "Is SEO included?",
    answer:
      "Basic SEO structure is included, such as metadata, headings, semantic layout, crawl-friendly content, and speed-minded setup.",
  },
  {
    question: "Can I request a landing page only?",
    answer:
      "Absolutely. Landing pages are ideal if you want to promote a single service, offer, product, or event without building a larger website first.",
  },
];
