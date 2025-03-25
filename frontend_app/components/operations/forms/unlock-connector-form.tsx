"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'

const schema = z.object({
  connectorId: z.string()
})

export type UnlockConnectorFormData = z.infer<typeof schema>

interface UnlockConnectorFormProps {
  onSubmit: (data: UnlockConnectorFormData) => Promise<void>
}

export function UnlockConnectorForm({ onSubmit }: UnlockConnectorFormProps) {
  const form = useForm<UnlockConnectorFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      connectorId: "1"
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Unlocking connector...
            </>
          ) : (
            "Unlock Connector"
          )}
        </Button>
      </form>
    </Form>
  )
}

