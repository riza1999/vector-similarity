'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/command'
import { type NL2SQL } from '@prisma/client'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useDebounce } from 'use-debounce'

export interface SearchProps {
  searchNL2SQL: (
    content: string
  ) => Promise<Array<NL2SQL & { similarity?: number }>>
}

export function SearchNL2SQL({ searchNL2SQL }: SearchProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<NL2SQL & { similarity?: number }>
  >([])
  const [debouncedQuery] = useDebounce(query, 500)
  useEffect(() => {
    let current = true
    if (debouncedQuery.trim().length > 0) {
      searchNL2SQL(debouncedQuery).then((results) => {
        if (current) {
          setSearchResults(results)
        }
      })
    }
    return () => {
      current = false
    }
  }, [debouncedQuery, searchNL2SQL])
  return (
    <div className="w-full">
      <Command label="Command Menu" shouldFilter={false} className="h-[200px]">
        <CommandInput
          id="search"
          placeholder="Type a question here . . ."
          className="focus:ring-0 sm:text-sm text-base focus:border-0 border-0 active:ring-0 active:border-0 ring-0 outline-0"
          value={query}
          onValueChange={(q) => setQuery(q)}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults.map((question) => (
            <CommandItem
              key={question.id}
              value={question.question}
              className="data-[selected='true']:bg-zinc-50  flex items-center justify-between py-3"
              onSelect={(p) => {
                console.log(p)
                toast.success(`You selected ${p}!`)
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    {question.question.substring(0, 90)}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {question.similarity ? (
                  <div className="text-xs font-mono p-0.5 rounded bg-zinc-100">
                    {question.similarity.toFixed(3)}
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}

SearchNL2SQL.displayName = 'Search'
