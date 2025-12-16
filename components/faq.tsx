"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How do I access the courses after enrollment?",
      answer: "Once you enroll in a course, you'll get instant access to all course materials through your student dashboard. You can access them 24/7 from any device with an internet connection for the next 6 months."
    },
    {
      question: "What is the refund policy?",
      answer: "We offer a satisfaction guarantee. If you're not happy with a course within the first 7 days of enrollment, contact us for a full refund. No questions asked."
    },
    {
      question: "Do I get a certificate after completing a course?",
      answer: "Yes! Upon completing all lessons and assignments in a course, you'll receive a certificate of completion that you can share on LinkedIn and add to your resume."
    },
    {
      question: "Can I download the course materials?",
      answer: "Absolutely! All courses include downloadable resources such as PDFs, cheat sheets, code files, and reference materials that you can keep forever."
    },
    {
      question: "How long do I have access to the courses?",
      answer: "You get 6 months of full access to all course content from the date of enrollment. This gives you plenty of time to learn at your own pace and revisit materials as needed."
    },
    {
      question: "Are the courses suitable for beginners?",
      answer: "Yes! We offer courses for all skill levels. Each course clearly indicates its difficulty level (Beginner, Intermediate, or Advanced) so you can choose the right one for you."
    },
    {
      question: "Can I access courses on mobile devices?",
      answer: "Yes, our platform is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. Learn anytime, anywhere!"
    },
    {
      question: "Do you offer student support?",
      answer: "Yes! You can contact our support team anytime through the contact page. We typically respond within 24 hours on business days."
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 text-sm px-4 py-1">FAQ</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Got questions? We've got answers. Find everything you need to know about our courses.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card 
                key={index} 
                className="border-2 overflow-hidden transition-all duration-300 hover:border-primary/20"
              >
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {faq.question}
                      </h3>
                      {openIndex === index && (
                        <p className="text-muted-foreground mt-3 leading-relaxed">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-primary" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help!
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
