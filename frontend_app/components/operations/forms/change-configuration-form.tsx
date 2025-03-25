"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'

const schema = z.object({
  keyType: z.enum(["Predefined", "Custom"]),
  configurationKey: z.string(),
  customKey: z.string().optional(),
  value: z.string()
})

export type ChangeConfigurationFormData = z.infer<typeof schema>

interface ChangeConfigurationFormProps {
  onSubmit: (data: ChangeConfigurationFormData) => Promise<void>
}

export function ChangeConfigurationForm({ onSubmit }: ChangeConfigurationFormProps) {
  const form = useForm<ChangeConfigurationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      keyType: "Predefined",
      configurationKey: "AllowOfflineTxForUnknownId",
      value: ""
    }
  })

  const keyType = form.watch("keyType")
  const configKey = form.watch("configurationKey")

  const getValueType = (key: string) => {
    const booleanKeys = [
      "AllowOfflineTxForUnknownId",
      "AuthorizationCacheEnabled",
      "AuthorizeRemoteTxRequests",
      "LocalAuthListEnabled",
      "LocalAuthorizeOffline",
      "LocalPreAuthorize",
      "StopTransactionOnEVSideDisconnect",
      "StopTransactionOnInvalidId",
      "UnlockConnectorOnEVSideDisconnect"
    ]
    const numberKeys = [
      "BlinkRepeat",
      "ClockAlignedDataInterval",
      "ConnectionTimeOut",
      "HeartbeatInterval",
      "LightIntensity",
      "MaxEnergyOnInvalidId",
      "MeterValueSampleInterval",
      "MinimumStatusDuration",
      "ResetRetries",
      "TransactionMessageAttempts",
      "TransactionMessageRetryInterval",
      "WebSocketPingInterval"
    ]
    
    if (booleanKeys.includes(key)) return "boolean"
    if (numberKeys.includes(key)) return "number"
    return "text"
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="keyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select key type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Predefined">Predefined</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {keyType === "Predefined" ? (
          <FormField
            control={form.control}
            name="configurationKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Configuration Key</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select configuration key" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AllowOfflineTxForUnknownId">AllowOfflineTxForUnknownId (boolean)</SelectItem>
                    <SelectItem value="AuthorizationCacheEnabled">AuthorizationCacheEnabled (boolean)</SelectItem>
                    <SelectItem value="AuthorizeRemoteTxRequests">AuthorizeRemoteTxRequests (boolean)</SelectItem>
                    <SelectItem value="BlinkRepeat">BlinkRepeat (in times)</SelectItem>
                    <SelectItem value="ClockAlignedDataInterval">ClockAlignedDataInterval (in seconds)</SelectItem>
                    <SelectItem value="ConnectionTimeOut">ConnectionTimeOut (in seconds)</SelectItem>
                    <SelectItem value="ConnectorPhaseRotation">ConnectorPhaseRotation (comma separated list)</SelectItem>
                    <SelectItem value="HeartbeatInterval">HeartbeatInterval (in seconds)</SelectItem>
                    <SelectItem value="LightIntensity">LightIntensity (in %)</SelectItem>
                    <SelectItem value="LocalAuthListEnabled">LocalAuthListEnabled (boolean)</SelectItem>
                    <SelectItem value="LocalAuthorizeOffline">LocalAuthorizeOffline (boolean)</SelectItem>
                    <SelectItem value="LocalPreAuthorize">LocalPreAuthorize (boolean)</SelectItem>
                    <SelectItem value="MaxEnergyOnInvalidId">MaxEnergyOnInvalidId (in Wh)</SelectItem>
                    <SelectItem value="MeterValueSampleInterval">MeterValueSampleInterval (in seconds)</SelectItem>
                    <SelectItem value="MeterValuesAlignedData">MeterValuesAlignedData (comma separated list)</SelectItem>
                    <SelectItem value="MeterValuesSampledData">MeterValuesSampledData (comma separated list)</SelectItem>
                    <SelectItem value="MeterValuesSignatureContexts">MeterValuesSignatureContexts (comma separated list; specific to OCMF)</SelectItem>
                    <SelectItem value="MinimumStatusDuration">MinimumStatusDuration (in seconds)</SelectItem>
                    <SelectItem value="ResetRetries">ResetRetries (in times)</SelectItem>
                    <SelectItem value="StopTransactionOnEVSideDisconnect">StopTransactionOnEVSideDisconnect (boolean)</SelectItem>
                    <SelectItem value="StopTransactionOnInvalidId">StopTransactionOnInvalidId (boolean)</SelectItem>
                    <SelectItem value="StopTransactionSignatureContexts">StopTransactionSignatureContexts (comma separated list; specific to OCMF)</SelectItem>
                    <SelectItem value="StopTransactionSignatureFormat">StopTransactionSignatureFormat (string; specific to OCMF)</SelectItem>
                    <SelectItem value="StopTxnAlignedData">StopTxnAlignedData (comma separated list)</SelectItem>
                    <SelectItem value="StopTxnSampledData">StopTxnSampledData (comma separated list)</SelectItem>
                    <SelectItem value="TransactionMessageAttempts">TransactionMessageAttempts (in times)</SelectItem>
                    <SelectItem value="TransactionMessageRetryInterval">TransactionMessageRetryInterval (in seconds)</SelectItem>
                    <SelectItem value="UnlockConnectorOnEVSideDisconnect">UnlockConnectorOnEVSideDisconnect (boolean)</SelectItem>
                    <SelectItem value="WebSocketPingInterval">WebSocketPingInterval (in seconds)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="customKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Key</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter custom key" />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                {getValueType(configKey) === "boolean" ? (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input {...field} type={getValueType(configKey)} placeholder="Enter value" />
                )}
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Changing configuration...
            </>
          ) : (
            "Change Configuration"
          )}
        </Button>
      </form>
    </Form>
  )
}

