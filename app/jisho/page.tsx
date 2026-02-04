import { Metadata } from "next"
import JishoDictionary from "@/components/jisho-dictionary"
import { Book, ArrowLeft, Code2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { InArticleAd, SidebarAd } from "@/components/ads"

export const metadata: Metadata = {
  title: "Japanese Dictionary | Jisho",
  description: "Search Japanese words, kanji, and phrases with our integrated Jisho dictionary. Free to use, no signup required.",
}

export default function PublicJishoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="py-6 px-4 mx-auto w-full md:w-[85vw] lg:w-[85vw]">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <Book className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Japanese Dictionary</h1>
                  <p className="text-sm text-muted-foreground">
                    Search words, kanji, and phrases - Free to use
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/playground">
                    <Code2 className="h-4 w-4 mr-2" />
                    Code Playground
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Ad before dictionary */}
          <div className="mb-4">
            <InArticleAd />
          </div>

          {/* Dictionary with optional Sidebar Ad */}
          <div className="flex gap-4">
            <div className="flex-1">
              <JishoDictionary />
            </div>
            <div className="hidden xl:block w-[300px] shrink-0">
              <SidebarAd />
            </div>
          </div>

          {/* Ad after dictionary */}
          <div className="mt-4">
            <InArticleAd />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
