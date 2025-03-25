"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'

const schema = z.object({
  hash: z.string().optional(),
  listVersion: z.string(),
  updateType: z.enum(["FULL", "DIFFERENTIAL"]),
  addUpdateList: z.string().optional(),
  deleteList: z.string().optional(),
  sendEmptyList: z.boolean().default(false)
})

export type SendLocalListFormData = z.infer<typeof schema>

interface SendLocalListFormProps {
  onSubmit: (data: SendLocalListFormData) => Promise<void>
}

export function SendLocalListForm({ onSubmit }: SendLocalListFormProps) {
  const form = useForm<SendLocalListFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      hash: "",
      listVersion: "",
      updateType: "FULL",
      addUpdateList: "",
      deleteList: "",
      sendEmptyList: false
    }
  })

  const updateType = form.watch("updateType")
  const sendEmptyList = form.watch("sendEmptyList")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="hash"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hash (String)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Optional, omitted for now" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="listVersion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>List Version (integer)</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="updateType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Update Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select update type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FULL">FULL</SelectItem>
                  <SelectItem value="DIFFERENTIAL">DIFFERENTIAL</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addUpdateList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add/Update List</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter one ID Tag per line"
                  disabled={sendEmptyList}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deleteList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delete List</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter one ID Tag per line"
                  disabled={sendEmptyList}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sendEmptyList"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Send empty list?
                </FormLabel>
                {updateType === "FULL" && (
                  <AlertDescription className="text-xs text-muted-foreground">
                    If selected and the update type is FULL, an empty list will be sent.
                    As a result, the charge point will remove all IdTags from its list.
                  </AlertDescription>
                )}
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending local list...
            </>
          ) : (
            "Send Local List"
          )}
        </Button>
      </form>
    </Form>
  )
}

