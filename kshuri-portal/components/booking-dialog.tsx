"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, Check, ChevronLeft, ChevronRight, Clock, Package } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/format"
import type { BookingPackage, TimeSlot } from "@/lib/types/vendor"

// TODO: wire eventTypes/cities to backend enums/meta once the booking flow is
// properly integrated (Phase 4+). For now the dialog uses hardcoded grooming-
// flavoured event types and a static city list — sufficient to keep the
// dialog renderable while the full booking integration is its own future spec.
const EVENT_TYPES = [
  'Self / Family',
  'Birthday',
  'Anniversary',
  'Festival',
  'Pre-wedding',
  'Other',
] as const

const CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Udaipur',
] as const

// TODO: wire to /availability/slots once the booking flow is properly integrated (Phase 4+)
const PLACEHOLDER_TIME_SLOTS: TimeSlot[] = [
  { id: '1', label: '10:00 AM', time: '10:00', available: true  },
  { id: '2', label: '11:30 AM', time: '11:30', available: true  },
  { id: '3', label: '01:00 PM', time: '13:00', available: false },
  { id: '4', label: '02:30 PM', time: '14:30', available: true  },
  { id: '5', label: '04:00 PM', time: '16:00', available: true  },
  { id: '6', label: '05:30 PM', time: '17:30', available: false },
]
import { cn } from "@/lib/utils"

// Step 1: Package selection
// Step 2: Date & Time
// Step 3: Your details
// Step 4: Confirmation

const detailsSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  eventType: z.string().min(1, "Please select an event type"),
  city: z.string().min(1, "Please select a city"),
  guestCount: z.string().optional(),
  message: z.string().optional(),
})

type DetailsFormData = z.infer<typeof detailsSchema>

interface BookingDialogProps {
  vendorName: string
  vendorId?: string
  children: React.ReactNode
}

export function BookingDialog({ vendorName, vendorId, children }: BookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedPackage, setSelectedPackage] = useState<BookingPackage | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)

  // TODO: fetch vendor packages from backend once booking flow is wired (Phase 4+)
  const packages: BookingPackage[] = []
  const hasPackages = packages.length > 0

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
  })

  const watchCity = watch("city")
  const watchEventType = watch("eventType")

  function resetAll() {
    setStep(1)
    setSelectedPackage(null)
    setSelectedDate(undefined)
    setSelectedTimeSlot(null)
    reset()
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) resetAll()
  }

  function onConfirmBooking(data: DetailsFormData) {
    toast.success("Booking Confirmed!", {
      description: `Your booking with ${vendorName} has been placed. You will receive a confirmation on ${data.email} shortly.`,
    })
    resetAll()
    setOpen(false)
  }

  const totalSteps = hasPackages ? 4 : 3
  const adjustedStep = hasPackages ? step : step + 1
  const [direction, setDirection] = useState(1)

  function goNext(nextStep: number) {
    setDirection(1)
    setStep(nextStep)
  }

  function goBack(prevStep: number) {
    setDirection(-1)
    setStep(prevStep)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Book {vendorName}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 py-2">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = i + 1
            const currentAdjusted = hasPackages ? step : step + 1
            const isActive = stepNum === (hasPackages ? step : step + 1)
            const isDone = stepNum < (hasPackages ? step : step + 1)
            return (
              <div key={i} className="flex flex-1 items-center gap-2">
                <motion.div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isDone && "bg-primary/20 text-primary",
                    !isActive && !isDone && "bg-muted text-muted-foreground"
                  )}
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
                </motion.div>
                {i < totalSteps - 1 && (
                  <div className="relative h-0.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary/30 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: isDone ? "100%" : "0%" }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground px-1 -mt-1">
          {hasPackages && <span>Package</span>}
          <span>Date & Time</span>
          <span>Details</span>
          <span>Confirm</span>
        </div>

        {/* ===== STEP 1: PACKAGE SELECTION ===== */}
        {hasPackages && step === 1 && (
          <div className="flex flex-col gap-4 pt-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Choose a Package</h3>
              <p className="text-xs text-muted-foreground mt-1">Select the package that best fits your needs</p>
            </div>

            <div className="flex flex-col gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPackage(pkg)}
                  className={cn(
                    "relative flex flex-col gap-2 rounded-lg border p-4 text-left transition-all hover:border-primary/50",
                    selectedPackage?.id === pkg.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border/60"
                  )}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 right-3 bg-gold text-gold-foreground text-[10px]">
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-semibold text-foreground">{pkg.name}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{pkg.description}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-primary">
                      {formatINR(pkg.price)}
                      {pkg.price < 5000 && <span className="text-[10px] font-normal text-muted-foreground">/plate</span>}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.features.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
                      >
                        <Check className="h-2.5 w-2.5 text-primary" />
                        {f}
                      </span>
                    ))}
                    {pkg.features.length > 4 && (
                      <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        +{pkg.features.length - 4} more
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => goNext(2)}
              disabled={!selectedPackage}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ===== STEP 2: DATE & TIME ===== */}
        {((hasPackages && step === 2) || (!hasPackages && step === 1)) && (
          <div className="flex flex-col gap-4 pt-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Choose Date & Time</h3>
              <p className="text-xs text-muted-foreground mt-1">Select your preferred event date and time slot</p>
            </div>

            {/* Date Picker */}
            <div className="flex flex-col gap-1.5">
              <Label>Event Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick your event date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(d) => d < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Slots */}
            <div className="flex flex-col gap-2">
              <Label>Preferred Time Slot *</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PLACEHOLDER_TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-lg border px-3 py-2.5 text-center transition-all",
                      selectedTimeSlot?.id === slot.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/60 hover:border-primary/30"
                    )}
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{slot.label}</span>
                    <span className="text-[10px] text-muted-foreground">{slot.time}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {hasPackages && (
                <Button variant="outline" onClick={() => goBack(1)} className="gap-1">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}
              <Button
                onClick={() => goNext(hasPackages ? 3 : 2)}
                disabled={!selectedDate || !selectedTimeSlot}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: YOUR DETAILS ===== */}
        {((hasPackages && step === 3) || (!hasPackages && step === 2)) && (
          <form
            onSubmit={handleSubmit((data) => {
              setStep(hasPackages ? 4 : 3)
            })}
            className="flex flex-col gap-4 pt-3"
          >
            <div>
              <h3 className="text-sm font-semibold text-foreground">Your Details</h3>
              <p className="text-xs text-muted-foreground mt-1">Tell us about yourself and your event</p>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="Your full name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" placeholder="+91 98765 43210" {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="you@email.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            {/* Event Type & City */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="eventType">Event Type *</Label>
                <select
                  id="eventType"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onChange={(e) => setValue("eventType", e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select event</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.eventType && <p className="text-xs text-destructive">{errors.eventType.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City *</Label>
                <select
                  id="city"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onChange={(e) => setValue("city", e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
            </div>

            {/* Guest Count */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guestCount">Expected Guest Count</Label>
              <Input id="guestCount" placeholder="e.g. 500" {...register("guestCount")} />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message">Special Requirements</Label>
              <Textarea
                id="message"
                placeholder="Any specific requirements or preferences..."
                rows={3}
                {...register("message")}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => goBack(hasPackages ? 2 : 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Review Booking <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* ===== STEP 4: CONFIRMATION ===== */}
        {((hasPackages && step === 4) || (!hasPackages && step === 3)) && (
          <div className="flex flex-col gap-4 pt-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Review & Confirm</h3>
              <p className="text-xs text-muted-foreground mt-1">Please review your booking details before confirming</p>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-secondary/30 p-4">
              {/* Vendor */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Vendor</span>
                <span className="text-sm font-semibold text-foreground">{vendorName}</span>
              </div>

              {/* Package */}
              {selectedPackage && (
                <>
                  <div className="h-px bg-border/60" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Package</span>
                    <span className="text-sm font-medium text-foreground">{selectedPackage.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Price</span>
                    <span className="text-sm font-bold text-primary">
                      {formatINR(selectedPackage.price)}
                      {selectedPackage.price < 5000 && "/plate"}
                    </span>
                  </div>
                </>
              )}

              {/* Date & Time */}
              <div className="h-px bg-border/60" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Date</span>
                <span className="text-sm font-medium text-foreground">
                  {selectedDate ? format(selectedDate, "PPP") : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Time Slot</span>
                <span className="text-sm font-medium text-foreground">
                  {selectedTimeSlot ? `${selectedTimeSlot.label} (${selectedTimeSlot.time})` : "-"}
                </span>
              </div>

              {/* Your Details */}
              <div className="h-px bg-border/60" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Event</span>
                <span className="text-sm text-foreground">{watchEventType || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">City</span>
                <span className="text-sm text-foreground">{watchCity || "-"}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              By confirming, you agree to Kshuri&apos;s terms of service. The vendor will confirm availability and all communication will happen through your Kshuri dashboard. No direct contact information will be shared until the booking is mutually confirmed.
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => goBack(hasPackages ? 3 : 2)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleSubmit(onConfirmBooking)}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
