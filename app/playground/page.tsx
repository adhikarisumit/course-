import { Metadata } from "next"
import CodeEditor from "@/components/code-editor"
import { Code2, ArrowLeft, Book } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { InArticleAd, SidebarAd, HeaderAd } from "@/components/ads"

export const metadata: Metadata = {
  title: "Code Playground",
  description: "Practice coding with our online code editor and compiler. Write, run, and test code in multiple programming languages. Free to use, no signup required.",
}

export default function PublicPlaygroundPage() {
  return (
    <>
      <Header />
      <HeaderAd />
      <main className="min-h-screen bg-background">
        <div className="container py-6 px-4 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Code Playground</h1>
                  <p className="text-sm text-muted-foreground">
                    Write, run, and test your code - Free to use
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/jisho">
                    <Book className="h-4 w-4 mr-2" />
                    Japanese Dictionary
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

          {/* Ad before editor */}
          <div className="mb-4">
            <InArticleAd />
          </div>

          {/* Code Editor with optional Sidebar Ad */}
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1">
              <CodeEditor />
            </div>
            <div className="w-full xl:w-[300px] xl:shrink-0">
              <SidebarAd />
            </div>
          </div>

          {/* Ad after editor */}
          <div className="mt-4">
            <InArticleAd />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
