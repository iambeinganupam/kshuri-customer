"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronRight, Mail, Phone, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormData = z.infer<typeof contactSchema>

const faqs = [
  {
    question: "How do I book a vendor on Kshuri?",
    answer:
      "Browse our vendor listings, visit a vendor's profile, and click 'Book Now'. Choose a package, select your preferred date and time slot, fill in your event details, and confirm your booking - all directly on the Kshuri platform. The vendor will confirm availability through our system.",
  },
  {
    question: "Is there any cost to use Kshuri as a customer?",
    answer:
      "No! Kshuri is completely free for customers. You can browse vendors, compare prices, view portfolios, read reviews, and make bookings at no cost. The service fee is handled on the vendor side.",
  },
  {
    question: "Can I contact vendors directly outside Kshuri?",
    answer:
      "All communication between customers and vendors happens exclusively through the Kshuri platform. This ensures transparency, accountability, and protection for both parties. Vendor contact details are not shared until a booking is mutually confirmed.",
  },
  {
    question: "How do I list my services on Kshuri?",
    answer:
      "If you are a grooming professional, click 'List Your Service' in the navigation bar or contact us through this page. Our team will guide you through the registration process, help set up your vendor profile, and review your portfolio.",
  },
  {
    question: "Are the vendors verified?",
    answer:
      "Yes! Vendors with the 'Verified' badge have been personally vetted by our team. We verify their business documents, portfolio, and client references before granting the badge. All reviews on Kshuri come from verified bookings only.",
  },
  {
    question: "Can I book vendors for at-home appointments?",
    answer:
      "Many of our vendors offer at-home services in addition to their salon or studio. You can filter by location and check availability for your desired city directly through the booking system.",
  },
  {
    question: "What if I'm not satisfied with a vendor's service?",
    answer:
      "Since all bookings are managed through Kshuri, we actively mediate any disputes. Our support team reviews the booking details, coordinates with the vendor, and ensures a fair resolution. Vendors with repeated complaints are removed from the platform.",
  },
  {
    question: "How does the booking process work?",
    answer:
      "The entire process happens on Kshuri: (1) Choose a vendor and select a package, (2) Pick your event date and time, (3) Fill in your details, (4) Confirm booking. The vendor then confirms availability through our platform. You can track everything from your dashboard.",
  },
]

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "hello@kshuri.in",
    subtitle: "We reply within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+91 98765 43210",
    subtitle: "Mon-Sat, 10AM - 7PM IST",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    detail: "Connaught Place, New Delhi",
    subtitle: "India 110001",
  },
]

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  function onSubmit(data: ContactFormData) {
    toast.success("Message Sent!", {
      description: "Thank you for reaching out. We will get back to you within 24 hours.",
    })
    reset()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-br from-primary/5 to-gold/5 px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <FadeIn>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">Contact</span>
              </div>
              <h1 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Get in Touch
              </h1>
              <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
                Have a question, feedback, or want to list your services? We would love to hear from you.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Contact Form + Info */}
        <section className="px-4 py-12 lg:py-16">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-5">
            {/* Contact Form */}
            <FadeIn delay={0.1} className="lg:col-span-3">
              <Card className="border-border/60">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="font-serif text-2xl font-bold text-card-foreground">
                    Send Us a Message
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Fill in the form below and our team will respond promptly.
                  </p>

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-6 flex flex-col gap-5"
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          {...register("name")}
                        />
                        {errors.name && (
                          <p className="text-xs text-destructive">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@email.com"
                          {...register("email")}
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="What is this about?"
                        {...register("subject")}
                      />
                      {errors.subject && (
                        <p className="text-xs text-destructive">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your query..."
                        rows={5}
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                      >
                        Send Message
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Contact Info */}
            <StaggerContainer staggerDelay={0.1} className="flex flex-col gap-5 lg:col-span-2">
              {contactInfo.map((info) => (
                <StaggerItem key={info.title} direction="right">
                  <Card className="border-border/60">
                    <CardContent className="flex items-start gap-4 p-5">
                      <motion.div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <info.icon className="h-5 w-5" />
                      </motion.div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-card-foreground">
                          {info.title}
                        </span>
                        <span className="text-sm text-foreground">
                          {info.detail}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {info.subtitle}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-secondary/30 px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-3xl">
            <FadeIn className="mb-8 text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium text-foreground">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
