import {create, StateCreator } from 'zustand'
import { CSSProperties } from 'react'
import { persist } from 'zustand/middleware'

// 定义了每个 Component 节点的类型  id、name、props 属性 
export interface Component {
  id: number    // 唯一标识
  name: string  // 组件类型名
  props: any    // 组件属性
  styles?: CSSProperties
  desc: string  // 显示描述
  children?: Component[]  // 子组件(树形结构)
  parentId?: number  // 父组件ID
}

// 定义了 add、delete、update 的增删改方法，用来修改 components 组件树
interface State {
  components: Component[]
  mode: 'edit' | 'preview'
  curComponentId?: number | null
  curComponent: Component | null
  past: Component[][]
  future: Component[][]
}

interface Action {
  addComponent: (component: Component, parentId?: number) => void
  deleteComponent: (componentId: number) => void
  updateComponentProps: (componentId: number, props: any) => void
  updateComponentStyles: (componentId: number, styles: CSSProperties, replace?: boolean) => void
  setCurComponentId: (componentId: number | null) => void
  setMode: (mode: State['mode']) => void
  undo: () => void
  redo: () => void
}


const creator: StateCreator<State & Action> = (set, get) => ({
  components: [
    {
      id: 1,
      name: 'Page',
      props: {},
      desc: '页面',
    }
  ],
  curComponentId: null,
  curComponent: null,
  mode: 'edit',
  past: [],
  future: [],
  undo: () => {
    const { past, components } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    const newPast = past.slice(0, -1)
    set({
      components: previous,
      past: newPast,
      future: [components, ...get().future],
    })
  },
  redo: () => {
    const { future, components } = get()
    if (future.length === 0) return
    const next = future[0]
    const newFuture = future.slice(1)
    set({
      components: next,
      future: newFuture,
      past: [...get().past, components],
    })
  },
  setMode: (mode) => set({mode}),
  setCurComponentId: (componentId) =>
    set((state) => ({
      curComponentId: componentId,
      curComponent: getComponentById(componentId, state.components),
    })),
  addComponent: (component, parentId) => {
    const components = get().components
    set({
      past: [...get().past, JSON.parse(JSON.stringify(components))],
      future: [],
    })
    set((state) => {
      if (parentId) {
        const parentComponent = getComponentById(
          parentId,
          state.components
        )

        if (parentComponent) {
          if (parentComponent.children) {
            parentComponent.children.push(component)
          } else {
            parentComponent.children = [component]
          }
        }

        component.parentId = parentId
        return {components: [...state.components]}
      }
      return {components: [...state.components, component]}
    })
  },
  deleteComponent: (componentId) => {
    if (!componentId) return
    const components = get().components
    set({
      past: [...get().past, JSON.parse(JSON.stringify(components))],
      future: [],
    })
    const component = getComponentById(componentId, get().components)
    if (component?.parentId) {
      const parentComponent = getComponentById(
        component.parentId,
        get().components
      )

      if (parentComponent) {
        parentComponent.children = parentComponent?.children?.filter(
          (item) => item.id !== +componentId
        )

        set({components: [...get().components]})
      }
    }
  },
  updateComponentProps: (componentId, props) => {
    const components = get().components
    set({
      past: [...get().past, JSON.parse(JSON.stringify(components))],
      future: [],
    })
    set((state) => {
      const component = getComponentById(componentId, state.components)
      if (component) {
        component.props = {...component.props, ...props}

        return {components: [...state.components]}
      }

      return {components: [...state.components]}
    })
  },
  updateComponentStyles: (componentId, styles, replace) => {
    const components = get().components
    set({
      past: [...get().past, JSON.parse(JSON.stringify(components))],
      future: [],
    })
    set((state) => {
      const component = getComponentById(componentId, state.components)
      if (component) {
        component.styles = replace ? {...styles} : {...component.styles, ...styles}

        return {components: [...state.components]}
      }

      return {components: [...state.components]}
    })
  },   
})

export const useComponetsStore = create<State & Action>()(persist(creator, {
  name: 'xxx'
}))

export function getComponentById(
    id: number | null,
    components: Component[]
  ): Component | null {
    if (!id) return null
  
    for (const component of components) {
      if (component.id == id) return component
      if (component.children && component.children.length > 0) {
        const result = getComponentById(id, component.children)
        if (result !== null) return result
      }
    }
    return null
}