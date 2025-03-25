"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'
import { ChargePoint } from "../../charge-points/charge-points-context"

const schema = z.object({
  transactionId: z.string(),
})

export type RemoteStopFormData = z.infer<typeof schema>

interface RemoteStopFormProps {
  onSubmit: (data: RemoteStopFormData) => Promise<void>
  chargePoint: ChargePoint
}

export function RemoteStopForm({ onSubmit, chargePoint }: RemoteStopFormProps) {
  const form = useForm<RemoteStopFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactionId: "1",
    }
  })

  // Mock active transactions
  const mockTransactions = [
    { id: "1", connector: "1", startTime: "2024-01-06T10:30:00" },
    { id: "2", connector: "2", startTime: "2024-01-06T11:45:00" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="transactionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID of the Active Transaction</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockTransactions.map(transaction => (
                    <SelectItem key={transaction.id} value={transaction.id}>
                      Transaction {transaction.id} (Connector {transaction.connector})
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
              Stopping transaction...
            </>
          ) : (
            "Stop Transaction"
          )}
        </Button>
      </form>
    </Form>
  )
}

