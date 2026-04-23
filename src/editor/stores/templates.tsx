import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Component } from './components'

export interface Template {
  id: string
  name: string
  description?: string
  components: Component[]
  createdAt: string
  updatedAt: string
}

interface State {
  templates: Template[]
}

interface Action {
  saveAsTemplate: (name: string, components: Component[], description?: string) => void
  deleteTemplate: (id: string) => void
  loadTemplate: (id: string) => Component[]
  exportTemplate: (id: string) => void
  importTemplate: (jsonString: string) => void
  exportAllTemplates: () => void
  importAllTemplates: (jsonString: string) => void
}

export const useTemplatesStore = create<State & Action>()(
  persist(
    (set, get) => ({
      templates: [],
      saveAsTemplate: (name, components, description) => {
        console.log('saveAsTemplate 调用，components 参数:', components)
        const now = new Date().toISOString()
        const cloned = JSON.parse(JSON.stringify(components))
        console.log('克隆后:', cloned)
        const template: Template = {
          id: now,
          name,
          description,
          components: cloned,
          createdAt: now,
          updatedAt: now,
        }
        console.log('保存的 template:', template)
        set((state) => ({
          templates: [...state.templates, template],
        }))
      },
      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }))
      },
      loadTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id)
        if (!template) return []
        return JSON.parse(JSON.stringify(template.components))
      },
      exportTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id)
        console.log('导出模板，id:', id, 'template:', template, '所有模板:', get().templates)
        if (!template) return
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template.name}.json`
        a.click()
        URL.revokeObjectURL(url)
      },
      importTemplate: (jsonString) => {
        const data = JSON.parse(jsonString)
        const now = new Date().toISOString()
        const template: Template = {
          id: data.id || now,
          name: data.name || '未命名模板',
          description: data.description,
          components: data.components || [],
          createdAt: data.createdAt || now,
          updatedAt: now,
        }
        set((state) => ({
          templates: [...state.templates, template],
        }))
      },
      exportAllTemplates: () => {
        const { templates } = get()
        const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'templates.json'
        a.click()
        URL.revokeObjectURL(url)
      },
      importAllTemplates: (jsonString) => {
        const data = JSON.parse(jsonString)
        const templates: Template[] = Array.isArray(data) ? data : [data]
        const now = new Date().toISOString()
        set((state) => ({
          templates: [
            ...state.templates,
            ...templates.map((t) => ({
              ...t,
              id: t.id || now,
              updatedAt: now,
            })),
          ],
        }))
      },
    }),
    { name: 'templates' }
  )
)
