"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'

const schema = z.object({})

export type ClearCacheFormData = z.infer<typeof schema>

interface ClearCacheFormProps {
  onSubmit: (data: ClearCacheFormData) => Promise<void>
}

export function ClearCacheForm({ onSubmit }: ClearCacheFormProps) {
  const form = useForm<ClearCacheFormData>({
    resolver: zodResolver(schema)
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert>
          <AlertDescription>
            This will clear the charge point&apos;s cache. This operation cannot be undone.
          </AlertDescription>
        </Alert>
        <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Clearing cache...
            </>
          ) : (
            "Clear Cache"
          )}
        </Button>
      </form>
    </Form>
  )
}

