"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from 'lucide-react'

const schema = z.object({
  selectedKeys: z.array(z.string()),
  customKeys: z.string().optional()
})

export type GetConfigurationFormData = z.infer<typeof schema>

interface GetConfigurationFormProps {
  onSubmit: (data: GetConfigurationFormData) => Promise<void>
}

export function GetConfigurationForm({ onSubmit }: GetConfigurationFormProps) {
  const form = useForm<GetConfigurationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      selectedKeys: [],
      customKeys: ""
    }
  })

  // Configuration keys from the screenshot
  const configurationKeys = [
    { key: "AllowOfflineTxForUnknownId", type: "boolean" },
    { key: "AuthorizationCacheEnabled", type: "boolean" },
    { key: "AuthorizeRemoteTxRequests", type: "boolean" },
    { key: "BlinkRepeat", type: "integer" },
    { key: "ChargeProfileMaxStackLevel", type: "integer" },
    { key: "ChargingScheduleAllowedChargingRateUnit", type: "list" },
    { key: "ChargingScheduleMaxPeriods", type: "integer" },
    { key: "ClockAlignedDataInterval", type: "integer" },
    { key: "ConnectionTimeOut", type: "integer" },
    { key: "ConnectorPhaseRotation", type: "list" },
    { key: "ConnectorPhaseRotationMaxLength", type: "integer" },
    { key: "ConnectorSwitch3to1PhaseSupported", type: "boolean" },
    { key: "GetConfigurationMaxKeys", type: "integer" },
    { key: "HeartbeatInterval", type: "integer" }
  ]

  const handleSelectAll = () => {
    form.setValue('selectedKeys', configurationKeys.map(k => k.key))
  }

  const handleSelectNone = () => {
    form.setValue('selectedKeys', [])
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert>
          <AlertDescription>
            If none selected, the charge point returns a list of all configuration settings.
          </AlertDescription>
        </Alert>
        
        <div className="flex space-x-2">
          <Button type="button" variant="secondary" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button type="button" variant="secondary" onClick={handleSelectNone}>
            Select None
          </Button>
        </div>

        <ScrollArea className="h-[200px] border rounded-md p-4">
          <FormField
            control={form.control}
            name="selectedKeys"
            render={() => (
              <div className="space-y-2">
                {configurationKeys.map((config) => (
                  <FormField
                    key={config.key}
                    control={form.control}
                    name="selectedKeys"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={config.key}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(config.key)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, config.key])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== config.key
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {config.key} ({config.type})
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            )}
          />
        </ScrollArea>

        <FormField
          control={form.control}
          name="customKeys"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Configuration Keys</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Optional comma separated list" />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting configuration...
            </>
          ) : (
            "Get Configuration"
          )}
        </Button>
      </form>
    </Form>
  )
}

