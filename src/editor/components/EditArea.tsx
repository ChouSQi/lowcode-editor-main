 
import { useEffect, useState } from "react"
import React from "react"
import { useComponentConfigStore } from "../stores/component-config"
import { Component, useComponetsStore } from "../stores/components"
import { type MouseEventHandler } from "react"
import HoverMask from "../components/HoverMask/index"
import SelectedMask from "../components/SelectedMask";


export function EditArea() {
    const { components, curComponentId, setCurComponentId } = useComponetsStore()
    const { componentConfig } = useComponentConfigStore()

    useEffect(()=> {
        // addComponent({
        //     id: 222,
        //     name: 'Container',
        //     props: {},
        //     children: []
        // }, 1);

        // addComponent({
        //     id: 333,
        //     name: 'Button',
        //     props: {
        //         text: '无敌'
        //     },
        //     children: []
        // }, 222);
    }, [])


    function renderComponents(components: Component[]): React.ReactNode {
        return components.map((component: Component) => {
            const config = componentConfig?.[component.name]

            if (!config?.dev) {
                return null
            }
            // 调用 addComponent 来添加 component 
            return React.createElement(
                // components 是一个树形结构，我们 render 的时候也要递归渲染
                config.dev,
                {
                    key: component.id,
                    id: component.id,
                    name: component.name,
                    styles: component.styles,
                    ...config.defaultProps,
                    ...component.props,
                },
                renderComponents(component.children || [])
            )
        })
    }

    const [hoverComponentId, setHoverComponentId] = useState<number>()

    const handleMouseOver: MouseEventHandler = (e)  => {
        const path = e.nativeEvent.composedPath()

        for (let i = 0; i < path.length; i += 1) {
            const ele = path[i] as HTMLElement

            const componentId = ele.dataset?.componentId
            // 找到元素的 data-component-id 设置为 hoverComponentId 的 state
            if (componentId) {
                setHoverComponentId(+componentId)
                return
            }
        }
    }

    // 点击事件触发时，找到元素对应的 component id，设置为 curComponentId
    const handleClick: MouseEventHandler = (e) => {
        const path = e.nativeEvent.composedPath()

        for (let i = 0; i < path.length; i += 1) {
            const ele = path[i] as HTMLElement

            const componentId = ele.dataset?.componentId
            if (componentId) {
                // 点击事件触发时，找到元素对应的 component id，设置为 curComponentId
                setCurComponentId(+componentId)
                return
            }
        }
    }

    return <div className="h-[100%] edit-area" onMouseOver={handleMouseOver} onMouseLeave={() => {
        setHoverComponentId(undefined);
    }} onClick={handleClick}>
        {renderComponents(components)}
        {hoverComponentId && hoverComponentId !== curComponentId &&(
            <HoverMask
                portalWrapperClassName='portal-wrapper'
                containerClassName='edit-area'
                componentId={hoverComponentId}
            />
        )}
        {curComponentId && (
            <SelectedMask
                portalWrapperClassName='portal-wrapper'
                containerClassName='edit-area'
                componentId={curComponentId}
            />
        )}
        <div className="portal-wrapper"></div>
    </div>
}
