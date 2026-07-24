'use client'

import { ProfileForm } from '@/components/dashboard/profile-form'
import { FadeIn } from '@/components/motion-wrapper'

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-xl font-semibold">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is how vendors see you when you book.
        </p>
      </FadeIn>
      <ProfileForm />
    </div>
  )
}
