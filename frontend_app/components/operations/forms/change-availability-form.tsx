"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'

const schema = z.object({
  connectorId: z.string(),
  type: z.enum(["Operative", "Inoperative"])
})

export type ChangeAvailabilityFormData = z.infer<typeof schema>

interface ChangeAvailabilityFormProps {
  onSubmit: (data: ChangeAvailabilityFormData) => Promise<void>
}

export function ChangeAvailabilityForm({ onSubmit }: ChangeAvailabilityFormProps) {
  const form = useForm<ChangeAvailabilityFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      connectorId: "",
      type: "Operative"
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
              <FormLabel>Connector ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter connector ID" />
              </FormControl>
              <FormDescription>
                Leave empty to apply to the entire charge point
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Operative">Operative</SelectItem>
                  <SelectItem value="Inoperative">Inoperative</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Changing availability...
            </>
          ) : (
            "Change Availability"
          )}
        </Button>
      </form>
    </Form>
  )
}

