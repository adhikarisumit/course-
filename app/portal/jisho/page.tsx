import { Metadata } from "next"
import JishoDictionary from "@/components/jisho-dictionary"
import { Book } from "lucide-react"
import { InArticleAd, SidebarAd, HeaderAd } from "@/components/ads"

export const metadata: Metadata = {
  title: "Japanese Dictionary | Jisho",
  description: "Search Japanese words, kanji, and phrases with our integrated Jisho dictionary",
}

export default function JishoPage() {
  return (
    <div className="py-6 px-4 mx-auto w-full md:w-[85vw] lg:w-[85vw]">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <Book className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Japanese Dictionary</h1>
            <p className="text-sm text-muted-foreground">
              Search words, kanji, and phrases
            </p>
          </div>
        </div>
      </div>

      <HeaderAd />

      {/* Dictionary with optional Sidebar Ad */}
      <div className="flex flex-col xl:flex-row gap-4 mt-4">
        <div className="flex-1">
          <JishoDictionary />
        </div>
        <div className="w-full xl:w-[300px] xl:shrink-0">
          <SidebarAd />
        </div>
      </div>

      <div className="mt-4">
        <InArticleAd />
      </div>
    </div>
  )
}
