import { Mail, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Have questions, suggestions, or want to contribute? We'd love to hear from you!
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Us
              </CardTitle>
              <CardDescription>Send us an email and we'll get back to you within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:sumitadhikari2341@gmail.com" className="text-primary hover:underline text-lg font-medium">
                sumitadhikari2341@gmail.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Suggest a Course
              </CardTitle>
              <CardDescription>Know a great course we should feature? Let us know!</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Email us to suggest courses, report broken links, or share feedback about our platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

