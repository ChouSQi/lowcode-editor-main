import { useMemo } from "react"
import { useComponentConfigStore } from "../stores/component-config"
import { MaterialItem } from './MaterialItem'

export function Material() {
    // 读取 componentConfig 里注册的所有组件类型，渲染出来
    const { componentConfig } = useComponentConfigStore()

    const components = useMemo(() => {
        return Object.values(componentConfig).filter(item => item.name !== 'Page')
     }, [componentConfig])

    return <div>{
        components.map((item, index) => {
            return <MaterialItem name={item.name} desc={item.desc} key={item.name + index}/>
        })
    }</div>
}
