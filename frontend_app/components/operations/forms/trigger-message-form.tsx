"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from 'lucide-react'

const schema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  messageId: z.string().optional(),
  data: z.string().optional()
})

export type TriggerMessageFormData = z.infer<typeof schema>

interface TriggerMessageFormProps {
  onSubmit: (data: TriggerMessageFormData) => Promise<void>
}

export function TriggerMessageForm({ onSubmit }: TriggerMessageFormProps) {
  const form = useForm<TriggerMessageFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vendorId: "",
      messageId: "",
      data: ""
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="vendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor ID (String)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter vendor ID" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="messageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message ID (String)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Optional" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data (Text)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Optional" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Triggering message...
            </>
          ) : (
            "Trigger Message"
          )}
        </Button>
      </form>
    </Form>
  )
}

