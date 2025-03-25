"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OperationsList } from "./operations-list"
import { ChangeAvailabilityForm } from "./forms/change-availability-form"
import { ChangeConfigurationForm } from "./forms/change-configuration-form"
import { ClearCacheForm } from "./forms/clear-cache-form"
import { GetDiagnosticsForm } from "./forms/get-diagnostics-form"
import { RemoteStartForm } from "./forms/remote-start-form"
import { RemoteStopForm } from "./forms/remote-stop-form"
import { ResetForm } from "./forms/reset-form"
import { UnlockConnectorForm } from "./forms/unlock-connector-form"
import { DataTransferForm } from "./forms/data-transfer-form"
import { Badge } from "@/components/ui/badge"
import { ChargePoint } from "../charge-points/charge-points-context"
import { useToast } from "@/components/ui/use-toast"
import { TriggerMessageForm } from "./forms/trigger-message-form"
import { GetLocalListVersionForm } from "./forms/get-local-list-version-form"
import { ReserveNowForm } from "./forms/reserve-now-form"
import { CancelReservationForm } from "./forms/cancel-reservation-form"
import { GetConfigurationForm } from "./forms/get-configuration-form"
import { SendLocalListForm } from "./forms/send-local-list-form"
import { SetChargingProfileForm } from "./forms/set-charging-profile-form"
import { ClearChargingProfileForm } from "./forms/clear-charging-profile-form"
import { GetCompositeScheduleForm } from "./forms/get-composite-schedule-form"

interface OperationsPanelProps {
  chargePoint: ChargePoint | null
}

export function OperationsPanel({ chargePoint }: OperationsPanelProps) {
  const [selectedOperation, setSelectedOperation] = useState<string>("change-availability")
  const { toast } = useToast()

  const handleSubmit = async (data: any) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      console.log(`Executing ${selectedOperation} for ${chargePoint?.id}:`, data)
      
      toast({
        title: "Operation Successful",
        description: `The ${selectedOperation} operation was completed successfully.`
      })
      
      setSelectedOperation(null)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: "There was an error executing the operation. Please try again."
      })
    }
  }

  if (!chargePoint) {
    return <div>No charge point data available</div>
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Operations</CardTitle>
            <CardDescription>
              Manage charging point operations
            </CardDescription>
          </div>
          <Badge variant="outline">{chargePoint.ocppProtocol}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Tabs defaultValue="operations" className="flex h-full flex-col">
          <div className="border-b px-6">
            <TabsList>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="operations" className="flex-1 p-0">
            <div className="grid h-full grid-cols-[280px,1fr] divide-x">
              <ScrollArea className="h-[500px]">
                <OperationsList 
                  protocol={chargePoint.ocppProtocol}
                  selectedOperation={selectedOperation}
                  onSelect={setSelectedOperation}
                />
              </ScrollArea>
              <div className="p-6">
                {selectedOperation ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">
                        {selectedOperation === "change-availability" && "Change Availability"}
                        {selectedOperation === "change-configuration" && "Change Configuration"}
                        {selectedOperation === "clear-cache" && "Clear Cache"}
                        {selectedOperation === "get-diagnostics" && "Get Diagnostics"}
                        {selectedOperation === "remote-start" && "Remote Start Transaction"}
                        {selectedOperation === "remote-stop" && "Remote Stop Transaction"}
                        {selectedOperation === "reset" && "Reset"}
                        {selectedOperation === "unlock-connector" && "Unlock Connector"}
                        {selectedOperation === "data-transfer" && "Data Transfer"}
                        {selectedOperation === "trigger-message" && "Trigger Message"}
                        {selectedOperation === "get-local-list-version" && "Get Local List Version"}
                        {selectedOperation === "reserve-now" && "Reserve Now"}
                        {selectedOperation === "cancel-reservation" && "Cancel Reservation"}
                        {selectedOperation === "get-configuration" && "Get Configuration"}
                        {selectedOperation === "send-local-list" && "Send Local List"}
                        {selectedOperation === "set-charging-profile" && "Set Charging Profile"}
                        {selectedOperation === "clear-charging-profile" && "Clear Charging Profile"}
                        {selectedOperation === "get-composite-schedule" && "Get Composite Schedule"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedOperation === "change-availability" && "Change the availability status of the charging point"}
                        {selectedOperation === "change-configuration" && "Modify the configuration of the charging point"}
                        {selectedOperation === "clear-cache" && "Clear the charging point's cache"}
                        {selectedOperation === "get-diagnostics" && "Retrieve diagnostic information from the charging point"}
                        {selectedOperation === "remote-start" && "Start a charging transaction remotely"}
                        {selectedOperation === "remote-stop" && "Stop an active charging transaction remotely"}
                        {selectedOperation === "reset" && "Perform a reset of the charging point"}
                        {selectedOperation === "unlock-connector" && "Unlock a connector of the charging point"}
                        {selectedOperation === "data-transfer" && "Transfer data to/from the charging point"}
                        {selectedOperation === "trigger-message" && "Trigger a message to the charging point"}
                        {selectedOperation === "get-local-list-version" && "Get the local list version from the charging point"}
                        {selectedOperation === "reserve-now" && "Reserve a connector on the charging point"}
                        {selectedOperation === "cancel-reservation" && "Cancel a reservation on the charging point"}
                        {selectedOperation === "get-configuration" && "Get the configuration of the charging point"}
                        {selectedOperation === "send-local-list" && "Send the local list to the charging point"}
                        {selectedOperation === "set-charging-profile" && "Set a charging profile for the charging point"}
                        {selectedOperation === "clear-charging-profile" && "Clear the charging profile for the charging point"}
                        {selectedOperation === "get-composite-schedule" && "Get the composite schedule for the charging point"}
                      </p>
                    </div>
                    {selectedOperation === "change-availability" && <ChangeAvailabilityForm onSubmit={handleSubmit} />}
                    {selectedOperation === "change-configuration" && <ChangeConfigurationForm onSubmit={handleSubmit} />}
                    {selectedOperation === "clear-cache" && <ClearCacheForm onSubmit={handleSubmit} />}
                    {selectedOperation === "get-diagnostics" && <GetDiagnosticsForm onSubmit={handleSubmit} />}
                    {selectedOperation === "remote-start" && <RemoteStartForm onSubmit={handleSubmit} chargePoint={chargePoint} />}
                    {selectedOperation === "remote-stop" && <RemoteStopForm onSubmit={handleSubmit} chargePoint={chargePoint} />}
                    {selectedOperation === "reset" && <ResetForm onSubmit={handleSubmit} />}
                    {selectedOperation === "unlock-connector" && <UnlockConnectorForm onSubmit={handleSubmit} />}
                    {selectedOperation === "data-transfer" && <DataTransferForm onSubmit={handleSubmit} />}
                    {selectedOperation === "trigger-message" && <TriggerMessageForm onSubmit={handleSubmit} />}
                    {selectedOperation === "get-local-list-version" && <GetLocalListVersionForm onSubmit={handleSubmit} />}
                    {selectedOperation === "reserve-now" && <ReserveNowForm onSubmit={handleSubmit} chargePoint={chargePoint} />}
                    {selectedOperation === "cancel-reservation" && <CancelReservationForm onSubmit={handleSubmit} />}
                    {selectedOperation === "get-configuration" && <GetConfigurationForm onSubmit={handleSubmit} />}
                    {selectedOperation === "send-local-list" && <SendLocalListForm onSubmit={handleSubmit} />}
                    {selectedOperation === "set-charging-profile" && <SetChargingProfileForm onSubmit={handleSubmit} />}
                    {selectedOperation === "clear-charging-profile" && <ClearChargingProfileForm onSubmit={handleSubmit} />}
                    {selectedOperation === "get-composite-schedule" && <GetCompositeScheduleForm onSubmit={handleSubmit} />}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Select an operation from the list
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="history" className="border-none p-6">
            <div className="text-sm text-muted-foreground">
              Operation history will be shown here
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

