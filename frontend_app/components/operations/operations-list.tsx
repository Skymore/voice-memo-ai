"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Power, Settings, Trash, FileSearch, Play, CircleStopIcon as Stop, RotateCw, Unlock, Database, MessageSquare, List, Calendar, XCircle, Upload, BarChart3, Zap } from 'lucide-react'

interface Operation {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  minProtocol: string
}

const operations: Operation[] = [
  {
    id: "change-availability",
    name: "Change Availability",
    icon: Power,
    description: "Change the availability status of the charging point",
    minProtocol: "ocpp1.2J"
  },
  {
    id: "change-configuration",
    name: "Change Configuration",
    icon: Settings,
    description: "Modify the configuration of the charging point",
    minProtocol: "ocpp1.2J"
  },
  {
    id: "clear-cache",
    name: "Clear Cache",
    icon: Trash,
    description: "Clear the charging point's cache",
    minProtocol: "ocpp1.2J"
  },
  {
    id: "get-diagnostics",
    name: "Get Diagnostics",
    icon: FileSearch,
    description: "Retrieve diagnostic information from the charging point",
    minProtocol: "ocpp1.2J"
  },
  {
    id: "remote-start",
    name: "Remote Start Transaction",
    icon: Play,
    description: "Start a charging transaction remotely",
    minProtocol: "ocpp1.2J"
  },
  {
    id: "remote-stop",
    name: "Remote Stop Transaction",
    icon: Stop,
    description: "Stop an active charging transaction remotely",
    minProtocol: "ocpp1.2J"
  },
  {
    id: "reset",
    name: "Reset",
    icon: RotateCw,
    description: "Perform a reset of the charging point",
    minProtocol: "ocpp1.2J"
  },
  {
    id: "unlock-connector",
    name: "Unlock Connector",
    icon: Unlock,
    description: "Unlock a connector of the charging point",
    minProtocol: "ocpp1.2J"
  },
  {
    id: "data-transfer",
    name: "Data Transfer",
    icon: Database,
    description: "Transfer data to/from the charging point",
    minProtocol: "ocpp1.2J"
  },
  {
    id: "trigger-message",
    name: "Trigger Message",
    icon: MessageSquare,
    description: "Trigger a message to be sent by the charge point",
    minProtocol: "ocpp1.6J"
  },
  {
    id: "get-local-list-version",
    name: "Get Local List Version",
    icon: List,
    description: "Get the version of the local authorization list",
    minProtocol: "ocpp1.6J"
  },
  {
    id: "reserve-now",
    name: "Reserve Now",
    icon: Calendar,
    description: "Create a reservation for a connector",
    minProtocol: "ocpp1.6J"
  },
  {
    id: "cancel-reservation",
    name: "Cancel Reservation",
    icon: XCircle,
    description: "Cancel an existing reservation",
    minProtocol: "ocpp1.6J"
  },
  {
    id: "get-configuration",
    name: "Get Configuration",
    icon: Settings,
    description: "Retrieve the configuration settings of the charge point",
    minProtocol: "ocpp1.6J"
  },
  {
    id: "send-local-list",
    name: "Send Local List",
    icon: Upload,
    description: "Send a local authorization list to the charging point",
    minProtocol: "ocpp1.6J"
  },
  {
    id: "set-charging-profile",
    name: "Set Charging Profile",
    icon: Zap,
    description: "Set a charging profile for the charging point",
    minProtocol: "ocpp1.6J"
  },
  {
    id: "clear-charging-profile",
    name: "Clear Charging Profile",
    icon: Trash,
    description: "Clear a charging profile from the charging point",
    minProtocol: "ocpp1.6J"
  },
  {
    id: "get-composite-schedule",
    name: "Get Composite Schedule",
    icon: BarChart3,
    description: "Get the composite charging schedule from the charging point",
    minProtocol: "ocpp1.6J"
  }
]

interface OperationsListProps {
  protocol: string
  selectedOperation: string | null
  onSelect: (operation: string) => void
}

export function OperationsList({ protocol, selectedOperation, onSelect }: OperationsListProps) {
  // Filter operations based on protocol version
  const protocolVersion = parseInt(protocol.replace(/\D/g, ""))
  const availableOperations = operations.filter(op => {
    const minVersion = parseInt(op.minProtocol.replace(/\D/g, ""))
    return protocolVersion >= minVersion
  })

  return (
    <div className="flex flex-col gap-2 p-4">
      {availableOperations.map((operation) => (
        <Button
          key={operation.id}
          variant="ghost"
          className={cn(
            "flex h-auto flex-col items-start gap-2 px-4 py-3",
            selectedOperation === operation.id && "bg-accent"
          )}
          onClick={() => onSelect(operation.id)}
        >
          <div className="flex w-full items-center gap-2">
            <operation.icon className="h-4 w-4" />
            <span className="flex-1 text-left font-medium">
              {operation.name}
            </span>
          </div>
          <span className="line-clamp-2 text-left text-xs text-muted-foreground">
            {operation.description}
          </span>
        </Button>
      ))}
    </div>
  )
}

