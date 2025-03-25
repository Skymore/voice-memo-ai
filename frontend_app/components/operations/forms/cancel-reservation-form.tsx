"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'

const schema = z.object({
  reservationId: z.string().min(1, "Reservation ID is required")
})

export type CancelReservationFormData = z.infer<typeof schema>

interface CancelReservationFormProps {
  onSubmit: (data: CancelReservationFormData) => Promise<void>
}

export function CancelReservationForm({ onSubmit }: CancelReservationFormProps) {
  const form = useForm<CancelReservationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reservationId: ""
    }
  })

  // Mock reservations data
  const mockReservations = [
    { id: "1", connector: "1", expiryDate: "2024-01-07T10:00:00" },
    { id: "2", connector: "2", expiryDate: "2024-01-07T14:30:00" }
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="reservationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID of the Existing Reservation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reservation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockReservations.map(reservation => (
                    <SelectItem key={reservation.id} value={reservation.id}>
                      Reservation {reservation.id} (Connector {reservation.connector})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelling reservation...
            </>
          ) : (
            "Cancel Reservation"
          )}
        </Button>
      </form>
    </Form>
  )
}

