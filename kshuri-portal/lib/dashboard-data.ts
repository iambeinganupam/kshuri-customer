// Simulated vendor dashboard analytics data

export interface DashboardStats {
  profileViews: number
  viewsChange: number // percentage change
  inquiries: number
  inquiriesChange: number
  bookings: number
  bookingsChange: number
  revenue: number
  revenueChange: number
  conversionRate: number
  avgRating: number
}

export interface ViewsDataPoint {
  date: string
  views: number
  inquiries: number
}

export interface InquiryItem {
  id: string
  customerName: string
  eventDate: string
  eventType: string
  message: string
  status: "new" | "responded" | "booked" | "declined"
  receivedAt: string
  budget: string
}

export const dashboardStats: DashboardStats = {
  profileViews: 2847,
  viewsChange: 18,
  inquiries: 63,
  inquiriesChange: 12,
  bookings: 14,
  bookingsChange: 24,
  revenue: 480000,
  revenueChange: 32,
  conversionRate: 22.2,
  avgRating: 4.8,
}

export const viewsData: ViewsDataPoint[] = [
  { date: "Feb 1", views: 78, inquiries: 3 },
  { date: "Feb 4", views: 92, inquiries: 4 },
  { date: "Feb 7", views: 85, inquiries: 2 },
  { date: "Feb 10", views: 110, inquiries: 5 },
  { date: "Feb 13", views: 145, inquiries: 7 },
  { date: "Feb 16", views: 132, inquiries: 4 },
  { date: "Feb 19", views: 168, inquiries: 8 },
  { date: "Feb 22", views: 198, inquiries: 6 },
  { date: "Feb 25", views: 220, inquiries: 9 },
  { date: "Feb 28", views: 185, inquiries: 5 },
  { date: "Mar 1", views: 245, inquiries: 7 },
  { date: "Mar 3", views: 189, inquiries: 3 },
]

export const recentInquiries: InquiryItem[] = [
  {
    id: "inq-1",
    customerName: "Priya Sharma",
    eventDate: "2026-04-15",
    eventType: "Wedding Reception",
    message: "Hi, I love your portfolio! We are planning a reception for 500 guests in Jaipur. Are you available on April 15?",
    status: "new",
    receivedAt: "2 hours ago",
    budget: "₹2-3 lakhs",
  },
  {
    id: "inq-2",
    customerName: "Rahul & Ankita",
    eventDate: "2026-05-20",
    eventType: "Destination Wedding",
    message: "We are having a destination wedding in Udaipur. Please share your destination wedding packages.",
    status: "responded",
    receivedAt: "1 day ago",
    budget: "₹5-8 lakhs",
  },
  {
    id: "inq-3",
    customerName: "Fatima Khan",
    eventDate: "2026-03-28",
    eventType: "Nikah Ceremony",
    message: "Looking for elegant decoration for a Nikah ceremony. Guest count is around 200.",
    status: "booked",
    receivedAt: "3 days ago",
    budget: "₹1.5-2 lakhs",
  },
  {
    id: "inq-4",
    customerName: "Deepak Gupta",
    eventDate: "2026-06-10",
    eventType: "Engagement Party",
    message: "Need a photographer for an intimate engagement party. Around 100 guests.",
    status: "new",
    receivedAt: "5 hours ago",
    budget: "₹50K-1 lakh",
  },
  {
    id: "inq-5",
    customerName: "Sanjay & Meera",
    eventDate: "2026-04-02",
    eventType: "Haldi Ceremony",
    message: "Is your team available for mehndi + haldi on the same day? We need 4 artists.",
    status: "declined",
    receivedAt: "5 days ago",
    budget: "₹20-30K",
  },
]

// Simulated booked dates for vendor availability calendar
export const bookedDates: Record<string, string[]> = {
  "v-1": ["2026-03-15", "2026-03-22", "2026-04-02", "2026-04-15", "2026-04-20", "2026-05-01", "2026-05-10"],
  "v-7": ["2026-03-10", "2026-03-18", "2026-03-25", "2026-04-05", "2026-04-12", "2026-04-28"],
  "v-12": ["2026-03-08", "2026-03-20", "2026-04-01", "2026-04-15", "2026-04-22", "2026-05-05"],
  "v-18": ["2026-03-14", "2026-03-28", "2026-04-10", "2026-04-18", "2026-05-02"],
  "v-23": ["2026-03-12", "2026-03-22", "2026-03-30", "2026-04-08", "2026-04-19", "2026-04-26", "2026-05-03"],
}

// Default booked dates for vendors not explicitly listed
export const defaultBookedDates = ["2026-03-20", "2026-04-10", "2026-04-25", "2026-05-08"]
