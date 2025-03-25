import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { usePromptManagement } from "./prompt-management-context"

export function PromptManagementHeader() {
  const { addCategory } = usePromptManagement()

  const handleAddCategory = () => {
    const name = prompt("Enter category name:")
    if (name) {
      addCategory(name)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Prompt Management DEMO ONLY (UNDER DEVELOPMENT)</h2>
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Prompt Management (UNDER DEVELOPMENT)</BreadcrumbPage>
          </BreadcrumbItem>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground">
          Manage categories, subcategories, and prompts for your AI system.
        </p>
      </div>
      <Button onClick={handleAddCategory}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Category
      </Button>
    </div>
  )
}

