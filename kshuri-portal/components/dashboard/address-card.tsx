'use client'

import { MapPin, MoreVertical } from 'lucide-react'
import type { AddressDto } from '@kshuri/api-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AddressCardProps {
  address: AddressDto
  onEdit: () => void
  onDelete: () => void
  onSetDefault?: () => void
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const lines = [
    address.address_line1,
    address.address_line2,
    address.landmark,
    address.city,
    address.state,
    address.postal_code,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{address.label || 'Address'}</h3>
                {address.is_default && (
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                    Default
                  </Badge>
                )}
              </div>
              {address.recipient_name && (
                <p className="mt-0.5 text-sm font-medium text-foreground">{address.recipient_name}</p>
              )}
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{lines}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              {onSetDefault && !address.is_default && (
                <DropdownMenuItem onClick={onSetDefault}>Set as default</DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-rose-600 focus:bg-rose-50 focus:text-rose-700"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
