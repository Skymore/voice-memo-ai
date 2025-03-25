"use client"

import { PromptManagementHeader } from "@/components/prompt-management/header"
import { PromptManagementContent } from "@/components/prompt-management/content"
import { PromptManagementProvider } from "@/components/prompt-management/prompt-management-context"

export default function PromptManagementPage() {
  return (
    <PromptManagementProvider>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PromptManagementHeader />
        <PromptManagementContent />
      </div>
    </PromptManagementProvider>
  )
}

