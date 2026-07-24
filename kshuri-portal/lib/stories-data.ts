// Wedding Stories / Inspiration Gallery data

export interface WeddingStory {
  id: string
  couple: string
  city: string
  style: "Traditional" | "Royal" | "Minimalist" | "Destination" | "Intimate"
  budgetRange: string
  description: string
  quote: string
  vendorCredits: { name: string; slug: string; role: string }[]
  functions: string[]
  guestCount: number
}

export const weddingStories: WeddingStory[] = [
  {
    id: "story-1",
    couple: "Aditya & Meera",
    city: "Jaipur",
    style: "Royal",
    budgetRange: "₹25-30 Lakhs",
    description: "A majestic Rajasthani-themed wedding at a heritage haveli with 800 guests, complete with a grand baraat procession, stunning floral mandap, and a 3-day celebration of love, food, and family.",
    quote: "Kshuri helped us find the most incredible vendors — from our mehndi artist to the caterer, everything was flawless!",
    vendorCredits: [
      { name: "Rani Mehndi Arts", slug: "rani-mehndi-arts", role: "Mehndi" },
      { name: "Royal Tent House", slug: "royal-tent-house", role: "Decoration" },
      { name: "PixelStory Studios", slug: "pixelstory-studios", role: "Photography" },
      { name: "Sharma Ji Ka Dhaba Catering", slug: "sharma-ji-ka-dhaba-catering", role: "Catering" },
    ],
    functions: ["Mehndi", "Haldi", "Wedding", "Reception"],
    guestCount: 800,
  },
  {
    id: "story-2",
    couple: "Imran & Zara",
    city: "Lucknow",
    style: "Traditional",
    budgetRange: "₹18-22 Lakhs",
    description: "An elegant Lucknowi wedding blending Mughal grandeur with warm family traditions. The highlight was the epic Mughlai feast that guests still talk about, and the stunning Nikah ceremony under jasmine canopies.",
    quote: "Finding Mughlai Dawat Caterers through Kshuri was the best decision — the biryani alone made our wedding legendary!",
    vendorCredits: [
      { name: "Mughlai Dawat Caterers", slug: "mughlai-dawat-caterers", role: "Catering" },
      { name: "Aisha Beauty Studio", slug: "aisha-beauty-studio", role: "Makeup" },
      { name: "Pushpa Tent & Light", slug: "pushpa-tent-light", role: "Decoration" },
      { name: "DreamFrame Cinematics", slug: "dreamframe-cinematics", role: "Videography" },
    ],
    functions: ["Mehndi", "Nikah", "Walima"],
    guestCount: 600,
  },
  {
    id: "story-3",
    couple: "Vikram & Ananya",
    city: "Udaipur",
    style: "Destination",
    budgetRange: "₹40-50 Lakhs",
    description: "A breathtaking destination wedding at a lakeside palace in Udaipur. The couple flew in guests from 4 countries for a 4-day celebration with a sunset phera ceremony that left everyone in tears of joy.",
    quote: "Our destination wedding was a dream come true. The photographer captured every magical moment beautifully.",
    vendorCredits: [
      { name: "WedFilms India", slug: "wedfilms-india", role: "Photo + Video" },
      { name: "Floral Fantasy Decor", slug: "floral-fantasy-decor", role: "Decoration" },
      { name: "Glamour by Neha", slug: "glamour-by-neha", role: "Makeup" },
      { name: "The Grand Kitchen", slug: "the-grand-kitchen", role: "Catering" },
    ],
    functions: ["Sangeet", "Mehndi", "Haldi", "Wedding", "Reception"],
    guestCount: 350,
  },
  {
    id: "story-4",
    couple: "Rohan & Sneha",
    city: "Bangalore",
    style: "Minimalist",
    budgetRange: "₹8-12 Lakhs",
    description: "A beautiful minimalist wedding that proved you don't need a massive budget for a perfect day. Intimate, meaningful, and stylish — with focus on quality over quantity in every detail.",
    quote: "We wanted simple and elegant. FotoWale gave us stunning photos without the premium price tag.",
    vendorCredits: [
      { name: "FotoWale", slug: "fotowale", role: "Photography" },
      { name: "Priya Mehendi Creations", slug: "priya-mehendi-creations", role: "Mehndi" },
      { name: "Ritu's Makeover Studio", slug: "ritus-makeover-studio", role: "Makeup" },
    ],
    functions: ["Mehndi", "Wedding", "Reception"],
    guestCount: 150,
  },
  {
    id: "story-5",
    couple: "Arjun & Priyanka",
    city: "Mumbai",
    style: "Intimate",
    budgetRange: "₹15-20 Lakhs",
    description: "An intimate yet luxurious celebration in Mumbai. Just 200 guests, but every detail was curated to perfection — from the MAC bridal makeover to the cinematic wedding film that became viral on Instagram.",
    quote: "Quality over quantity — that was our mantra. Every vendor Kshuri recommended exceeded our expectations.",
    vendorCredits: [
      { name: "MAC Pro Bridal Studio", slug: "mac-pro-bridal-studio", role: "Makeup" },
      { name: "Shubh Decorators", slug: "shubh-decorators", role: "Decoration" },
      { name: "Zainab Henna Studio", slug: "zainab-henna-studio", role: "Mehndi" },
      { name: "PixelStory Studios", slug: "pixelstory-studios", role: "Photography" },
    ],
    functions: ["Sangeet", "Mehndi", "Haldi", "Wedding", "Reception"],
    guestCount: 200,
  },
  {
    id: "story-6",
    couple: "Suresh & Lalitha",
    city: "Chennai",
    style: "Traditional",
    budgetRange: "₹10-15 Lakhs",
    description: "A grand South Indian wedding with traditional banana leaf feast, elaborate kolam decorations, and the bride in a stunning Kanchipuram silk saree. The Sadya was the talk of the town!",
    quote: "Annapurna's banana leaf Sadya transported everyone back to their grandparents' village — pure nostalgia!",
    vendorCredits: [
      { name: "Annapurna Bhog Caterers", slug: "annapurna-bhog-caterers", role: "Catering" },
      { name: "Snap Tales Photography", slug: "snap-tales-photography", role: "Photography" },
    ],
    functions: ["Muhurtham", "Reception"],
    guestCount: 500,
  },
]
