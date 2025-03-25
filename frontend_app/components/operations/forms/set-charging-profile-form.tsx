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
  chargingProfileId: z.string(),
  connectorId: z.string()
})

export type SetChargingProfileFormData = z.infer<typeof schema>

interface SetChargingProfileFormProps {
  onSubmit: (data: SetChargingProfileFormData) => Promise<void>
}

export function SetChargingProfileForm({ onSubmit }: SetChargingProfileFormProps) {
  const form = useForm<SetChargingProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      chargingProfileId: "",
      connectorId: "0"
    }
  })

  // Mock charging profiles
  const mockProfiles = [
    { id: "1", name: "Profile 1" },
    { id: "2", name: "Profile 2" },
    { id: "3", name: "Profile 3" }
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="chargingProfileId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Charging Profile ID</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select charging profile" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockProfiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
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
                <Input {...field} placeholder="0 = charge point as a whole" />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting charging profile...
            </>
          ) : (
            "Set Charging Profile"
          )}
        </Button>
      </form>
    </Form>
  )
}

