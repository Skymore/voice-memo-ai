"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'

const schema = z.object({
  type: z.enum(["HARD", "SOFT"])
})

export type ResetFormData = z.infer<typeof schema>

interface ResetFormProps {
  onSubmit: (data: ResetFormData) => Promise<void>
}

export function ResetForm({ onSubmit }: ResetFormProps) {
  const form = useForm<ResetFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "HARD"
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reset Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reset type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HARD">Hard Reset</SelectItem>
                  <SelectItem value="SOFT">Soft Reset</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Performing reset...
            </>
          ) : (
            "Perform Reset"
          )}
        </Button>
      </form>
    </Form>
  )
}

