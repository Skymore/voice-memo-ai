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
  filterType: z.string(),
  chargingProfileId: z.string().optional(),
  connectorId: z.string().optional(),
  chargingProfilePurpose: z.string().optional(),
  stackLevel: z.string().optional()
})

export type ClearChargingProfileFormData = z.infer<typeof schema>

interface ClearChargingProfileFormProps {
  onSubmit: (data: ClearChargingProfileFormData) => Promise<void>
}

export function ClearChargingProfileForm({ onSubmit }: ClearChargingProfileFormProps) {
  const form = useForm<ClearChargingProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      filterType: "ChargingProfileId",
      chargingProfileId: "",
      connectorId: "0",
      chargingProfilePurpose: "none",
      stackLevel: ""
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="filterType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filter Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ChargingProfileId">ChargingProfileId</SelectItem>
                  <SelectItem value="ConnectorId">ConnectorId</SelectItem>
                  <SelectItem value="ChargingProfilePurpose">ChargingProfilePurpose</SelectItem>
                  <SelectItem value="StackLevel">StackLevel</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="connectorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector ID (integer)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0 = charge point as a whole. Leave empty to not set." />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chargingProfilePurpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Charging Profile Purpose</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Empty --" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">-- Empty --</SelectItem>
                  <SelectItem value="ChargePointMaxProfile">ChargePointMaxProfile</SelectItem>
                  <SelectItem value="TxDefaultProfile">TxDefaultProfile</SelectItem>
                  <SelectItem value="TxProfile">TxProfile</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stackLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stack Level (integer)</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Clearing charging profile...
            </>
          ) : (
            "Clear Charging Profile"
          )}
        </Button>
      </form>
    </Form>
  )
}

