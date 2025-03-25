"use client";

import { useState } from "react";
import { AudioRecordingsProvider } from "@/components/audio-recordings/audio-recordings-context";
import { AudioRecordingsCombined, FilterValues } from "@/components/audio-recordings/AudioRecordingsCombined";
import { AudioRecordingsHeader } from "@/components/audio-recordings/header"


export default function AudioRecordingsPage() {
  const [filters, setFilters] = useState<FilterValues>({
    job_id: "",
    status: "all",
    created_at: new Date().toISOString().split('T')[0], // Default to today's date
  });

  return (
    <AudioRecordingsProvider>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AudioRecordingsHeader />
        <AudioRecordingsCombined initialFilters={filters} />
      </div>
    </AudioRecordingsProvider>
  );
}
