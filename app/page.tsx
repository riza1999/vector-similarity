import { searchNL2SQL, searchNL2SQLNoEmbed, searchAutoNormal } from '@/app/actions'
import {SearchNL2SQL} from "@/components/search_nl2sql";
import {type NL2SQL} from "@prisma/client";

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="pt-4 pb-8 bg-gradient-to-br from-black via-[#171717] to-[#575757] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        DQLab AI
      </h1>
      <SearchCard title={'Searching With Embedding'} doSearch={searchNL2SQL}/>
      <SearchCard title={'Searching With No Embedding'} doSearch={searchNL2SQLNoEmbed}/>
      <SearchCard title={'Searching Autocomplete normal'} doSearch={searchAutoNormal}/>
    </main>
  )
}

interface SearchCardProps {
    title: string,
    doSearch: (query: string) => Promise<Array<NL2SQL & { similarity?: number }>>
}

function SearchCard({title, doSearch}:SearchCardProps){
  return (
      <div className="bg-white/30 my-4 p-6 lg:p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
                {title}
            </h2>
            <p className="text-sm text-gray-500 leading-5">
              Try &quot;tampilkan&quot; or &quot;teratas&quot;. Cosine similarity is used to find the most
              similar question.
            </p>
          </div>
        </div>
        <div className="divide-y divide-gray-900/5">
          <SearchNL2SQL searchNL2SQL={doSearch} />
        </div>
      </div>
  )
}
