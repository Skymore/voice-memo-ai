"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'
import { ChargePoint } from "../../charge-points/charge-points-context"

const schema = z.object({
  connectorId: z.string(),
  expiryDateTime: z.string(),
  idTag: z.string()
})

export type ReserveNowFormData = z.infer<typeof schema>

interface ReserveNowFormProps {
  onSubmit: (data: ReserveNowFormData) => Promise<void>
  chargePoint: ChargePoint
}

export function ReserveNowForm({ onSubmit, chargePoint }: ReserveNowFormProps) {
  const form = useForm<ReserveNowFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      connectorId: "1",
      expiryDateTime: "",
      idTag: "HASSANIEN001"
    }
  })

  // Mock data for OCPP ID Tags
  const mockIdTags = ["HASSANIEN001", "USER123", "TAG456", "RFID789"]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="connectorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector ID</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select connector" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Connector 1</SelectItem>
                  <SelectItem value="2">Connector 2</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expiryDateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date/Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="idTag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OCPP ID Tag</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID tag" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockIdTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
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
              Creating reservation...
            </>
          ) : (
            "Reserve Now"
          )}
        </Button>
      </form>
    </Form>
  )
}

