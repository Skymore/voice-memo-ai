import { Button } from "@/components/ui/button"
import { Upload } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb"
import Link from "next/link"

export function AudioRecordingsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Audio Recordings</h2>
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Audio Recordings</BreadcrumbPage>
          </BreadcrumbItem>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground">
          Manage and monitor all uploaded audio files and their processing status.
        </p>
      </div>
      <Link href="/audio-upload">
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Add New Audio Recording
        </Button>
      </Link>
    </div>
  )
}

