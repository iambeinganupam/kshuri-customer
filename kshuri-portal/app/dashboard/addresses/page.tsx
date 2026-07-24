'use client'

import { useState } from 'react'
import { Plus, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  type AddressDto,
} from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { AddressCard } from '@/components/dashboard/address-card'
import { AddressFormDialog } from '@/components/dashboard/address-form-dialog'
import { SkeletonCard } from '@/components/skeleton-card'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'

export default function AddressesPage() {
  const q = useAddresses()
  const del = useDeleteAddress()
  const setDefault = useSetDefaultAddress()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AddressDto | undefined>(undefined)

  function openAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }
  function openEdit(addr: AddressDto) {
    setEditing(addr)
    setDialogOpen(true)
  }
  function handleDelete(addr: AddressDto) {
    if (!confirm(`Delete "${addr.label || 'this address'}"?`)) return
    del.mutate(addr.id, {
      onSuccess: () => toast.success('Address deleted.'),
      onError:   () => toast.error('Could not delete — please try again.'),
    })
  }
  function handleSetDefault(addr: AddressDto) {
    setDefault.mutate(addr.id, {
      onSuccess: () => toast.success('Default address updated.'),
      onError:   () => toast.error('Could not set default — please try again.'),
    })
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Saved addresses</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the locations you book to most — we&apos;ll suggest them at checkout.
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </FadeIn>

      {q.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SkeletonCard count={3} />
        </div>
      ) : (q.data ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MapPin className="mb-4 h-6 w-6 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No saved addresses</h3>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Add an address now so checkout is faster next time.
          </p>
          <Button onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add an address
          </Button>
        </div>
      ) : (
        <StaggerContainer staggerDelay={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {q.data!.map((addr) => (
            <StaggerItem key={addr.id}>
              <AddressCard
                address={addr}
                onEdit={() => openEdit(addr)}
                onDelete={() => handleDelete(addr)}
                onSetDefault={() => handleSetDefault(addr)}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
      />
    </div>
  )
}
