// Wedding checklist data organized by timeline phases

export interface ChecklistTask {
  id: string
  title: string
  description: string
  categoryLink?: string // link to vendor category
}

export interface ChecklistPhase {
  id: string
  title: string
  timeframe: string
  icon: string
  tasks: ChecklistTask[]
}

export const checklistPhases: ChecklistPhase[] = [
  {
    id: "phase-1",
    title: "Early Planning",
    timeframe: "12-9 months before",
    icon: "📋",
    tasks: [
      {
        id: "t-1",
        title: "Set your wedding budget",
        description: "Discuss with family and decide the total budget for all events.",
        categoryLink: "/planner",
      },
      {
        id: "t-2",
        title: "Decide the wedding date(s)",
        description: "Check auspicious dates (muhurat) and family availability.",
      },
      {
        id: "t-3",
        title: "Book the wedding venue",
        description: "Visit and finalize the banquet hall, farmhouse, or hotel.",
        categoryLink: "/services/wedding-venues",
      },
      {
        id: "t-4",
        title: "Shortlist photographers & videographers",
        description: "Check portfolios, book early — top photographers get booked fast.",
        categoryLink: "/services/photography-video",
      },
      {
        id: "t-5",
        title: "Book an event manager (optional)",
        description: "A planner can handle all vendor coordination and logistics.",
        categoryLink: "/services/event-managers",
      },
    ],
  },
  {
    id: "phase-2",
    title: "Vendor Booking",
    timeframe: "8-6 months before",
    icon: "🤝",
    tasks: [
      {
        id: "t-6",
        title: "Finalize caterer / halwai",
        description: "Schedule food tasting, finalize menu, and confirm guest count.",
        categoryLink: "/services/catering-halwai",
      },
      {
        id: "t-7",
        title: "Book tent & decoration vendor",
        description: "Discuss themes, mandap design, lighting, and floral arrangements.",
        categoryLink: "/services/tent-decoration",
      },
      {
        id: "t-8",
        title: "Book makeup artist",
        description: "Schedule a trial for bridal makeup and look.",
        categoryLink: "/services/makeup-artist",
      },
      {
        id: "t-9",
        title: "Book mehndi artist",
        description: "Confirm availability for mehndi ceremony day.",
        categoryLink: "/services/mehndi-artist",
      },
      {
        id: "t-10",
        title: "Send save-the-date to guests",
        description: "Create a guest list and share dates via WhatsApp or cards.",
      },
    ],
  },
  {
    id: "phase-3",
    title: "Detail Planning",
    timeframe: "5-3 months before",
    icon: "🎨",
    tasks: [
      {
        id: "t-11",
        title: "Order wedding invitations",
        description: "Design and print physical or digital wedding invitations.",
      },
      {
        id: "t-12",
        title: "Finalize decoration theme",
        description: "Confirm flower choices, colour palette, mandap design, and stage layout.",
        categoryLink: "/services/tent-decoration",
      },
      {
        id: "t-13",
        title: "Shop for wedding outfits",
        description: "Start shopping for lehenga/sherwani, family outfits, and accessories.",
      },
      {
        id: "t-14",
        title: "Create sangeet /mehndi event plan",
        description: "Plan performances, games, DJ, and food for each pre-wedding event.",
      },
      {
        id: "t-15",
        title: "Book pandit / maulvi",
        description: "Confirm the religious officiant for the ceremony.",
      },
    ],
  },
  {
    id: "phase-4",
    title: "Final Preparations",
    timeframe: "2-1 months before",
    icon: "✨",
    tasks: [
      {
        id: "t-16",
        title: "Confirm all vendor bookings",
        description: "Call every vendor and reconfirm dates, times, and requirements.",
      },
      {
        id: "t-17",
        title: "Final menu tasting",
        description: "Do a final round of food tasting with the caterer.",
        categoryLink: "/services/catering-halwai",
      },
      {
        id: "t-18",
        title: "Bridal makeup trial",
        description: "Final trial with the MUA — confirm the look and products.",
        categoryLink: "/services/makeup-artist",
      },
      {
        id: "t-19",
        title: "Finalize guest list & seating",
        description: "Confirm final headcount and create seating arrangements.",
      },
      {
        id: "t-20",
        title: "Pre-wedding photoshoot",
        description: "Schedule your pre-wedding shoot at a scenic location.",
        categoryLink: "/services/photography-video",
      },
    ],
  },
  {
    id: "phase-5",
    title: "Wedding Week",
    timeframe: "7 days before",
    icon: "🎉",
    tasks: [
      {
        id: "t-21",
        title: "Pack wedding trousseau",
        description: "Organize all outfits, jewellery, accessories for each function.",
      },
      {
        id: "t-22",
        title: "Final vendor coordination call",
        description: "Share venue address, timings, and contact numbers with all vendors.",
      },
      {
        id: "t-23",
        title: "Prepare baraat essentials",
        description: "Arrange band, baaja, ghodi, flowers for the baraat procession.",
      },
      {
        id: "t-24",
        title: "Give final payment to vendors",
        description: "Settle all remaining payments and confirmations.",
      },
      {
        id: "t-25",
        title: "Relax and enjoy!",
        description: "You have planned everything beautifully. Trust the process and celebrate! 🎊",
      },
    ],
  },
]

// Default budget allocation percentages by category
export const defaultBudgetSplit: Record<string, { label: string; percent: number; slug: string }> = {
  venue: { label: "Wedding Venue", percent: 25, slug: "wedding-venues" },
  catering: { label: "Catering / Halwai", percent: 25, slug: "catering-halwai" },
  decoration: { label: "Tent & Decoration", percent: 15, slug: "tent-decoration" },
  photography: { label: "Photography & Video", percent: 10, slug: "photography-video" },
  makeup: { label: "Makeup Artist", percent: 8, slug: "makeup-artist" },
  mehndi: { label: "Mehndi Artist", percent: 3, slug: "mehndi-artist" },
  events: { label: "Event Manager", percent: 6, slug: "event-managers" },
  miscellaneous: { label: "Outfits, Jewellery & Misc", percent: 8, slug: "" },
}
