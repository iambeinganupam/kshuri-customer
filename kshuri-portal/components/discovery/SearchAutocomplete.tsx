'use client';

import { useDeferredValue, useState } from 'react';
import { useAutocomplete } from '@kshuri/api-client';
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandSeparator,
} from '@/components/ui/command';

interface SearchAutocompleteProps {
  city?: string;
  onSelect: (target: { kind: 'vendor' | 'service' | 'category'; id: string; slug?: string | null }) => void;
  placeholder?: string;
}

export function SearchAutocomplete({
  city,
  onSelect,
  placeholder = 'Search vendors, services, categories…',
}: SearchAutocompleteProps) {
  const [q, setQ] = useState('');
  const deferredQ = useDeferredValue(q);
  const { data, isLoading } = useAutocomplete(deferredQ, city);

  const hasResults =
    !!data && (data.vendors.length + data.services.length + data.categories.length > 0);

  return (
    <Command shouldFilter={false} className="rounded-lg border shadow-md">
      <CommandInput
        placeholder={placeholder}
        value={q}
        onValueChange={setQ}
      />
      <CommandList>
        {!!data && !hasResults && !isLoading && (
          <CommandEmpty>No results.</CommandEmpty>
        )}
        {isLoading && (
          <div className="px-3 py-2 text-xs text-muted-foreground">Loading…</div>
        )}
        {data && data.vendors.length > 0 && (
          <>
            <CommandGroup heading="Vendors">
              {data.vendors.map((v) => (
                <CommandItem
                  key={`v-${v.id}`}
                  value={`v-${v.id}`}
                  onSelect={() => onSelect({ kind: 'vendor', id: v.id, slug: v.slug })}
                >
                  <span>{v.name}</span>
                  {v.city && (
                    <span className="ml-auto text-xs text-muted-foreground">{v.city}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        {data && data.services.length > 0 && (
          <>
            <CommandGroup heading="Services">
              {data.services.map((s) => (
                <CommandItem
                  key={`s-${s.id}`}
                  value={`s-${s.id}`}
                  onSelect={() => onSelect({ kind: 'service', id: s.id, slug: s.vendorSlug })}
                >
                  <span>{s.name}</span>
                  {s.vendorName && (
                    <span className="ml-auto text-xs text-muted-foreground">{s.vendorName}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        {data && data.categories.length > 0 && (
          <CommandGroup heading="Categories">
            {data.categories.map((c) => (
              <CommandItem
                key={`c-${c.id}`}
                value={`c-${c.id}`}
                onSelect={() => onSelect({ kind: 'category', id: c.id, slug: c.slug })}
              >
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
