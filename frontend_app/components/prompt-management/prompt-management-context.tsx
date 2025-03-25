"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface Prompt {
  id: string
  title: string
  content: string
  category: string
  subcategory: string
  versions: PromptVersion[]
}

interface PromptVersion {
  id: string
  content: string
  timestamp: number
  comment?: string
}

interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  prompts: Prompt[]
}

interface PromptManagementContextType {
  categories: Category[]
  selectedCategory: string | null
  selectedSubcategory: string | null
  selectedPrompt: Prompt | null
  setSelectedCategory: (categoryId: string | null) => void
  setSelectedSubcategory: (subcategoryId: string | null) => void
  setSelectedPrompt: (promptId: string | null) => void
  addCategory: (name: string) => void
  addSubcategory: (categoryId: string, name: string) => void
  addPrompt: (categoryId: string, subcategoryId: string, prompt: Omit<Prompt, 'id' | 'versions'>) => void
  updatePrompt: (promptId: string, content: string, comment?: string) => void
  deletePrompt: (promptId: string) => void
  deleteCategory: (categoryId: string) => void
  deleteSubcategory: (categoryId: string, subcategoryId: string) => void
}

const PromptManagementContext = createContext<PromptManagementContextType | undefined>(undefined)

export function PromptManagementProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)

  const addCategory = useCallback((name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      subcategories: []
    }
    setCategories(prev => [...prev, newCategory])
  }, [])

  const addSubcategory = useCallback((categoryId: string, name: string) => {
    setCategories(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: [...category.subcategories, { id: Date.now().toString(), name, prompts: [] }]
        }
      }
      return category
    }))
  }, [])

  const addPrompt = useCallback((categoryId: string, subcategoryId: string, prompt: Omit<Prompt, 'id' | 'versions'>) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: Date.now().toString(),
      versions: [{ id: Date.now().toString(), content: prompt.content, timestamp: Date.now() }]
    }
    setCategories(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.map(subcategory => {
            if (subcategory.id === subcategoryId) {
              return {
                ...subcategory,
                prompts: [...subcategory.prompts, newPrompt]
              }
            }
            return subcategory
          })
        }
      }
      return category
    }))
  }, [])

  const updatePrompt = useCallback((promptId: string, content: string, comment?: string) => {
    setCategories(prev => prev.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        prompts: subcategory.prompts.map(prompt => {
          if (prompt.id === promptId) {
            return {
              ...prompt,
              content,
              versions: [
                { id: Date.now().toString(), content, timestamp: Date.now(), comment },
                ...prompt.versions
              ]
            }
          }
          return prompt
        })
      }))
    })))
  }, [])

  const deletePrompt = useCallback((promptId: string) => {
    setCategories(prev => prev.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        prompts: subcategory.prompts.filter(prompt => prompt.id !== promptId)
      }))
    })))
  }, [])

  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(category => category.id !== categoryId))
  }, [])

  const deleteSubcategory = useCallback((categoryId: string, subcategoryId: string) => {
    setCategories(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.filter(subcategory => subcategory.id !== subcategoryId)
        }
      }
      return category
    }))
  }, [])

  return (
    <PromptManagementContext.Provider value={{
      categories,
      selectedCategory,
      selectedSubcategory,
      selectedPrompt,
      setSelectedCategory,
      setSelectedSubcategory,
      setSelectedPrompt,
      addCategory,
      addSubcategory,
      addPrompt,
      updatePrompt,
      deletePrompt,
      deleteCategory,
      deleteSubcategory
    }}>
      {children}
    </PromptManagementContext.Provider>
  )
}

export function usePromptManagement() {
  const context = useContext(PromptManagementContext)
  if (context === undefined) {
    throw new Error('usePromptManagement must be used within a PromptManagementProvider')
  }
  return context
}

