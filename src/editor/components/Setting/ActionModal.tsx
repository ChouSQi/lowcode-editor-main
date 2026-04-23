import { Modal, Segmented } from "antd"
import { useEffect, useState } from "react"
import { GoToLink, GoToLinkConfig } from "./actions/GoToLink"
import { ShowMessage, ShowMessageConfig } from "./actions/ShowMessage"
import { CustomJS, CustomJSConfig } from "./actions/CustomJS"
import React from 'react'
import { ComponentMethod, ComponentMethodConfig } from "./actions/ComponentMethod"

export type ActionConfig = GoToLinkConfig | ShowMessageConfig | CustomJSConfig | ComponentMethodConfig

export interface ActionModalProps {
    visible: boolean
    action?: ActionConfig
    handleOk: (config?: ActionConfig) => void
    handleCancel: () => void
}

export function ActionModal(props: ActionModalProps) {
    const {
        visible,
        action,
        handleOk,
        handleCancel
    } = props

    const map = {
        goToLink: '访问链接',
        showMessage: '消息提示',
        componentMethod: '组件方法',
        customJS: '自定义 JS'
    }

    const [key, setKey] = useState<string>('访问链接')
    const [curConfig, setCurConfig] = useState<ActionConfig>()

    // ✅ 使用 Effect，但通过 useRef 记录上一次的值来避免不必要的更新
    const prevActionRef = React.useRef(action)

    useEffect(() => {
        // 只在 action 真正变化时才更新
        if (action?.type && prevActionRef.current !== action) {
            const newKey = map[action.type]
            if (newKey && newKey !== key) {
                setKey(newKey)
                setCurConfig(undefined)
            }
            prevActionRef.current = action
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action]) // 故意不加 key 依赖，因为我们需要在 key 变化时不触发 effect

    // 当 modal 关闭时重置状态
    useEffect(() => {
        if (!visible) {
            setCurConfig(undefined)
        }
    }, [visible])

    return  <Modal 
        title="事件动作配置" 
        width={800}
        open={visible}
        okText="确认"
        cancelText="取消"
        onOk={() => handleOk(curConfig)}
        onCancel={handleCancel}
    >
        <div className="h-[500px]">
            <Segmented 
                value={key} 
                onChange={(newKey) => {
                    setKey(newKey)
                    setCurConfig(undefined)
                }} 
                block 
                options={['访问链接', '消息提示', '组件方法', '自定义 JS']} 
            />
            {
                key === '访问链接' && 
                <GoToLink 
                    key="goToLink" 
                    value={action?.type === 'goToLink' ? action.url : ''} 
                    onChange={(config) => {
                        setCurConfig(config)
                    }}
                />
            }
            {
                key === '消息提示' && 
                <ShowMessage  
                    key="showMessage" 
                    value={action?.type === 'showMessage' ? action.config : undefined} 
                    onChange={(config) => {
                        setCurConfig(config)
                    }}
                />
            }
            {
                key === '组件方法' && <ComponentMethod  key="showMessage" value={action?.type === 'componentMethod' ? action.config : undefined} onChange={(config) => {
                    setCurConfig(config)
                }}/>
            }
            {
                key === '自定义 JS' && 
                <CustomJS 
                    key="customJS" 
                    value={action?.type === 'customJS' ? action.code : ''} 
                    onChange={(config) => {
                        setCurConfig(config)
                    }}
                />
            }
        </div>
    </Modal>
}