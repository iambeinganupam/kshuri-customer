'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import {
  useCreateAddress,
  useUpdateAddress,
  type AddressDto,
} from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AddressFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an AddressDto to edit; omit for "add new". */
  initial?: AddressDto
}

type AddressFormState = {
  label:          string
  recipient_name: string
  contact_phone:  string
  address_line1:  string
  address_line2:  string
  landmark:       string
  city:           string
  state:          string
  postal_code:    string
}

function hydrate(initial?: AddressDto): AddressFormState {
  return {
    label:          initial?.label          ?? '',
    recipient_name: initial?.recipient_name ?? '',
    contact_phone:  initial?.contact_phone  ?? '',
    address_line1:  initial?.address_line1  ?? '',
    address_line2:  initial?.address_line2  ?? '',
    landmark:       initial?.landmark       ?? '',
    city:           initial?.city           ?? '',
    state:          initial?.state          ?? '',
    postal_code:    initial?.postal_code    ?? '',
  }
}

export function AddressFormDialog({ open, onOpenChange, initial }: AddressFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The key ensures fresh state every time we switch between add/edit-X/
          edit-Y — the FormBody's lazy useState initialiser runs on each mount.
          This avoids a useEffect → setState pattern that React's
          react-you-might-not-need-an-effect rule discourages. */}
      <DialogContent className="sm:max-w-md" key={initial?.id ?? 'new'}>
        <AddressFormBody initial={initial} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function AddressFormBody({
  initial,
  onClose,
}: {
  initial?: AddressDto
  onClose: () => void
}) {
  const [form, setForm] = useState<AddressFormState>(() => hydrate(initial))
  const create = useCreateAddress()
  const update = useUpdateAddress()

  function setField<K extends keyof AddressFormState>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    // Strip optional empty strings so backend doesn't get blank values
    const payload = {
      address_line1:  form.address_line1,
      city:           form.city,
      state:          form.state,
      ...(form.label          && { label:          form.label }),
      ...(form.recipient_name && { recipient_name: form.recipient_name }),
      ...(form.contact_phone  && { contact_phone:  form.contact_phone }),
      ...(form.address_line2  && { address_line2:  form.address_line2 }),
      ...(form.landmark       && { landmark:       form.landmark }),
      ...(form.postal_code    && { postal_code:    form.postal_code }),
    }

    if (initial?.id) {
      update.mutate(
        { id: initial.id, payload },
        {
          onSuccess: () => { toast.success('Address updated.'); onClose() },
          onError:   () => toast.error('Could not save — please try again.'),
        },
      )
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success('Address added.'); onClose() },
        onError:   () => toast.error('Could not add — please try again.'),
      })
    }
  }

  const isEditing = !!initial?.id
  const isBusy = isEditing ? update.isPending : create.isPending

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit address' : 'Add address'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) => setField('label', e.target.value)}
              placeholder="Home, Work, etc."
            />
          </div>
          <div>
            <Label htmlFor="recipient_name">Recipient name</Label>
            <Input
              id="recipient_name"
              value={form.recipient_name}
              onChange={(e) => setField('recipient_name', e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="address_line1">Address line 1 *</Label>
          <Input
            id="address_line1"
            value={form.address_line1}
            onChange={(e) => setField('address_line1', e.target.value)}
            placeholder="House / flat / building"
            required
          />
        </div>
        <div>
          <Label htmlFor="address_line2">Address line 2</Label>
          <Input
            id="address_line2"
            value={form.address_line2}
            onChange={(e) => setField('address_line2', e.target.value)}
            placeholder="Street, colony (optional)"
          />
        </div>
        <div>
          <Label htmlFor="landmark">Landmark</Label>
          <Input
            id="landmark"
            value={form.landmark}
            onChange={(e) => setField('landmark', e.target.value)}
            placeholder="Near… (optional)"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={form.state}
              onChange={(e) => setField('state', e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="postal_code">Postal code</Label>
            <Input
              id="postal_code"
              value={form.postal_code}
              onChange={(e) => setField('postal_code', e.target.value)}
              pattern="[0-9]{6}"
              inputMode="numeric"
              placeholder="6-digit PIN"
            />
          </div>
          <div>
            <Label htmlFor="contact_phone">Contact phone</Label>
            <Input
              id="contact_phone"
              value={form.contact_phone}
              onChange={(e) => setField('contact_phone', e.target.value)}
              inputMode="tel"
              placeholder="Optional"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy ? 'Saving…' : isEditing ? 'Save changes' : 'Add address'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
