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
  connectorId: z.string(),
  idTag: z.string(),
})

export type RemoteStartFormData = z.infer<typeof schema>

interface RemoteStartFormProps {
  onSubmit: (data: RemoteStartFormData) => Promise<void>
  chargePoint: ChargePoint
}

export function RemoteStartForm({ onSubmit, chargePoint }: RemoteStartFormProps) {
  const form = useForm<RemoteStartFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      connectorId: "1",
      idTag: "HASSANIEN001",
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
              Starting transaction...
            </>
          ) : (
            "Start Transaction"
          )}
        </Button>
      </form>
    </Form>
  )
}

