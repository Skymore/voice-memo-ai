"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'

const schema = z.object({
  connectorId: z.string(),
  duration: z.string().optional(),
  chargingRateUnit: z.string()
})

export type GetCompositeScheduleFormData = z.infer<typeof schema>

interface GetCompositeScheduleFormProps {
  onSubmit: (data: GetCompositeScheduleFormData) => Promise<void>
}

export function GetCompositeScheduleForm({ onSubmit }: GetCompositeScheduleFormProps) {
  const form = useForm<GetCompositeScheduleFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      connectorId: "0",
      duration: "",
      chargingRateUnit: "none"
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="connectorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector ID (integer)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0 = charge point as a whole" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (in seconds)</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chargingRateUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Charging Rate Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Empty --" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">-- Empty --</SelectItem>
                  <SelectItem value="W">W</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting composite schedule...
            </>
          ) : (
            "Get Composite Schedule"
          )}
        </Button>
      </form>
    </Form>
  )
}

