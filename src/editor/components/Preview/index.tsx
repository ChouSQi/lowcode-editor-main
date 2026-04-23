import React from "react"
import { useRef } from "react"
import { useComponentConfigStore } from "../../stores/component-config"
import { Component, useComponetsStore } from "../../stores/components"
import { message } from 'antd'
import { ActionConfig } from "../Setting/ActionModal"
// import { ShowMessage } from "../Setting/actions/ShowMessage"

export function Preview() {
    const { components } = useComponetsStore()
    const { componentConfig } = useComponentConfigStore()

    const componentRefs = useRef<Record<string, any>>({})

    function handleEvent(component: Component) {
        const props: Record<string, any> = {}

        componentConfig[component.name].events?.forEach((event) => {
            const eventConfig = component.props[event.name]

            if (eventConfig) {
                props[event.name] = (...args: any[]) => {
                    eventConfig?.actions?.forEach((action: ActionConfig) => {
                        if (action.type === 'goToLink') {
                            window.location.href = action.url
                        } else if (action.type === 'showMessage') {
                            if (action.config.type === 'success') {
                                message.success(action.config.text)
                            } else if (action.config.type === 'error') {
                                message.error(action.config.text)
                            }
                        }else if(action.type === 'customJS') {
                            const func = new Function('context', 'args', action.code)
                            func({
                                name: component.name,
                                props: component.props,
                                ShowMessage(content: string){
                                    message.success(content)
                                }
                            }, args)
                        }else if (action.type === 'componentMethod') {
                            // ✅ 在事件处理函数中读取 ref，而不是在渲染时
                            const targetComponent = componentRefs.current[action.config.componentId];
                            if (targetComponent && targetComponent[action.config.method]) {
                                targetComponent[action.config.method]?.(...args)
                            }
                        }
                    })

                }
            }
        })
        return props
    }

    function renderComponents(components: Component[]): React.ReactNode {
        return components.map((component: Component) => {
            const config = componentConfig?.[component.name]

            if (!config?.prod) {
                return null
            }
            
            return React.createElement(
                config.prod,
                {
                    key: component.id,
                    id: component.id,
                    name: component.name,
                    styles: component.styles,
                    ref: (ref: Record<string, any>) => { componentRefs.current[component.id] = ref; },
                    ...config.defaultProps,
                    ...component.props,
                    ...handleEvent(component)
                },
                renderComponents(component.children || [])
            )
        })
    }

    return <div>
        {/* eslint-disable-next-line */}
        {renderComponents(components)}
    </div>
}
