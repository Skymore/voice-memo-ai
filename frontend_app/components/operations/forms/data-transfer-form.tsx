"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'

const schema = z.object({
  location: z.string().min(1, "Location is required"),
  retries: z.string().optional(),
  retryInterval: z.string().optional(),
  retrieveDateTime: z.string().optional()
})

export type DataTransferFormData = z.infer<typeof schema>

interface DataTransferFormProps {
  onSubmit: (data: DataTransferFormData) => Promise<void>
}

export function DataTransferForm({ onSubmit }: DataTransferFormProps) {
  const form = useForm<DataTransferFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      location: "",
      retries: "",
      retryInterval: "",
      retrieveDateTime: ""
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (directory URI)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter location URI" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="retries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retries (integer)</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="Optional" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="retryInterval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retry Interval (integer)</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="Optional" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="retrieveDateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retrieve Date/Time</FormLabel>
              <FormControl>
                <Input {...field} type="datetime-local" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transferring data...
            </>
          ) : (
            "Transfer Data"
          )}
        </Button>
      </form>
    </Form>
  )
}

