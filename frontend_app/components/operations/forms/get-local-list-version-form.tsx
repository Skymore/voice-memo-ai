"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'

const schema = z.object({})

export type GetLocalListVersionFormData = z.infer<typeof schema>

interface GetLocalListVersionFormProps {
  onSubmit: (data: GetLocalListVersionFormData) => Promise<void>
}

export function GetLocalListVersionForm({ onSubmit }: GetLocalListVersionFormProps) {
  const form = useForm<GetLocalListVersionFormData>({
    resolver: zodResolver(schema)
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert>
          <AlertDescription>
            No parameters required. This operation will retrieve the version number of the local authorization list.
          </AlertDescription>
        </Alert>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting version...
            </>
          ) : (
            "Get Version"
          )}
        </Button>
      </form>
    </Form>
  )
}

