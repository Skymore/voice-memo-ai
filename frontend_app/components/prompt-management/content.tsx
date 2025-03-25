"use client"

import { useState } from "react"
import { usePromptManagement } from "./prompt-management-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, ChevronDown, Folder, File, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MarkdownEditor } from "./markdown-editor"

export function PromptManagementContent() {
  const {
    categories,
    selectedCategory,
    selectedSubcategory,
    selectedPrompt,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedPrompt,
    addSubcategory,
    addPrompt,
    updatePrompt,
    deletePrompt,
    deleteCategory,
    deleteSubcategory
  } = usePromptManagement()

  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [newPromptTitle, setNewPromptTitle] = useState("")
  const [newPromptContent, setNewPromptContent] = useState("")

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleAddSubcategory = (categoryId: string) => {
    const name = prompt("Enter subcategory name:")
    if (name) {
      addSubcategory(categoryId, name)
    }
  }

  const handleAddPrompt = () => {
    if (selectedCategory && selectedSubcategory && newPromptTitle && newPromptContent) {
      addPrompt(selectedCategory, selectedSubcategory, {
        title: newPromptTitle,
        content: newPromptContent,
        category: selectedCategory,
        subcategory: selectedSubcategory
      })
      setNewPromptTitle("")
      setNewPromptContent("")
    }
  }

  const handleUpdatePrompt = (content: string) => {
    if (selectedPrompt) {
      updatePrompt(selectedPrompt.id, content)
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <Card className="col-span-3">
        <CardContent className="p-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            {categories.map(category => (
              <div key={category.id} className="mb-2">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {expandedCategories.includes(category.id) ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                    <Folder className="mr-2 h-4 w-4" />
                    {category.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {expandedCategories.includes(category.id) && (
                  <div className="ml-6 mt-2">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-2"
                          onClick={() => {
                            setSelectedCategory(category.id)
                            setSelectedSubcategory(subcategory.id)
                          }}
                        >
                          <File className="mr-2 h-4 w-4" />
                          {subcategory.name}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSubcategory(category.id, subcategory.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-2"
                      onClick={() => handleAddSubcategory(category.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subcategory
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="col-span-9">
        <CardContent className="p-6">
          {selectedCategory && selectedSubcategory ? (
            <>
              <h3 className="text-2xl font-semibold mb-4">Prompts</h3>
              <div className="grid gap-4">
                {categories
                  .find(c => c.id === selectedCategory)
                  ?.subcategories.find(s => s.id === selectedSubcategory)
                  ?.prompts.map(prompt => (
                    <Button
                      key={prompt.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => setSelectedPrompt(prompt)}
                    >
                      {prompt.title}
                    </Button>
                  ))}
              </div>
              <Separator className="my-4" />
              <h4 className="text-lg font-semibold mb-2">Add New Prompt</h4>
              <div className="space-y-4">
                <Input
                  placeholder="Prompt Title"
                  value={newPromptTitle}
                  onChange={(e) => setNewPromptTitle(e.target.value)}
                />
                <MarkdownEditor
                  initialContent={newPromptContent}
                  onSave={(content) => setNewPromptContent(content)}
                />
                <Button onClick={handleAddPrompt}>Add Prompt</Button>
              </div>
            </>
          ) : selectedPrompt ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">{selectedPrompt.title}</h3>
              <MarkdownEditor
                initialContent={selectedPrompt.content}
                onSave={handleUpdatePrompt}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">View Version History</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Version History</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[300px] w-full">
                    {selectedPrompt.versions.map((version, index) => (
                      <div key={version.id} className="mb-4">
                        <h4 className="font-semibold">Version {selectedPrompt.versions.length - index}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(version.timestamp).toLocaleString()}
                        </p>
                        <p className="mt-2">{version.content.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this prompt?")) {
                    deletePrompt(selectedPrompt.id)
                    setSelectedPrompt(null)
                  }
                }}
              >
                Delete Prompt
              </Button>
            </div>
          ) : (
            <Alert>
              <AlertTitle>No Selection</AlertTitle>
              <AlertDescription>
                Please select a category and subcategory to manage prompts.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

