'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useProfile, useUpdateProfile } from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { SkeletonCard } from '@/components/skeleton-card'

// ProfileUpdatePayload accepts first_name and last_name (email is not mutable)
type ProfileFormState = { first_name: string; last_name: string }

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile()
  const update = useUpdateProfile()

  // Form state holds user edits only. When `null`, inputs read directly from
  // `profile` (the source of truth). This avoids a useEffect→setState pattern
  // that React's `react-you-might-not-need-an-effect` rule discourages and
  // keeps the form trivially reset on a refetch (no manual sync needed).
  const [draft, setDraft] = useState<ProfileFormState | null>(null)

  const form: ProfileFormState = draft ?? {
    first_name: profile?.first_name ?? '',
    last_name:  profile?.last_name  ?? '',
  }
  const dirty = draft !== null

  function setField<K extends keyof ProfileFormState>(key: K, val: string) {
    setDraft({ ...form, [key]: val })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    // useUpdateProfile accepts ProfileUpdatePayload: { first_name?, last_name?, ... }
    update.mutate(form, {
      onSuccess: () => {
        toast.success('Profile updated.')
        setDraft(null)
      },
      onError: () => toast.error('Could not save — please try again.'),
    })
  }

  if (isLoading) return <SkeletonCard count={1} />

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => setField('first_name', e.target.value)}
                placeholder="Aanya"
                autoComplete="given-name"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => setField('last_name', e.target.value)}
                placeholder="Sharma"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email ?? '—'}
              disabled
              className="bg-muted"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Email cannot be changed here — contact support to update it.
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={profile?.phone_number ?? '—'}
              disabled
              className="bg-muted"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Phone is your login identifier — contact support to change it.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="submit" disabled={!dirty || update.isPending}>
              {update.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
