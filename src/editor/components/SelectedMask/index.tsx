import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { getComponentById, useComponetsStore } from '../../stores/components'
import { Dropdown, Popconfirm, Space } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { Component } from "../../stores/components"

interface SelectedMaskProps {
  portalWrapperClassName: string
  containerClassName: string
  componentId: number
}

function SelectedMask({ containerClassName, portalWrapperClassName, componentId }: SelectedMaskProps) {
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    labelTop: 0,
    labelLeft: 0,
  })

  const { components, curComponentId, curComponent, deleteComponent, setCurComponentId } = useComponetsStore()

  // ✅ 合并为一个 useEffect
  useEffect(() => {
    function updatePosition() {
      if (!componentId) return

      const container = document.querySelector(`.${containerClassName}`)
      if (!container) return

      const node = document.querySelector(`[data-component-id="${componentId}"]`)
      if (!node) return

      const { top, left, width, height } = node.getBoundingClientRect()
      const { top: containerTop, left: containerLeft } = container.getBoundingClientRect()

      let labelTop = top - containerTop + container.scrollTop
      const labelLeft = left - containerLeft + width

      if (labelTop <= 0) {
        labelTop -= -20
      }
    
      setPosition({
        top: top - containerTop + container.scrollTop,
        left: left - containerLeft + container.scrollLeft,
        width,
        height,
        labelTop,
        labelLeft,
      })
    }

    updatePosition()

    const timerId = setTimeout(() => {
      updatePosition()
    }, 200)
    
    // 添加滚动和窗口大小监听
    const container = document.querySelector(`.${containerClassName}`)
    if (container) {
      container.addEventListener('scroll', updatePosition)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        clearTimeout(timerId)

        if (container) {
          container.removeEventListener('scroll', updatePosition)
          window.removeEventListener('resize', updatePosition)
        }
      }
    }
  }, [componentId, containerClassName, components]) // ✅ 添加所有依赖

  const el = useMemo(() => {
    return document.querySelector(`.${portalWrapperClassName}`)
  }, [portalWrapperClassName])

  const curSelectedComponent = useMemo(() => {
    return getComponentById(componentId, components)
  }, [componentId, components])

  function handleDelete() {
    deleteComponent(curComponentId!)
    setCurComponentId(null)
  }

  const parentComponents = useMemo(() => {
    const parentComponents: Component[] = []
    let component = curComponent

    while (component?.parentId) {
      component = getComponentById(component.parentId, components)!
      parentComponents.push(component)
    }

    return parentComponents
  }, [curComponent, components])

  // 如果没有位置信息，不渲染
  if (position.width === 0 && position.height === 0) {
    return null
  }

  if (!el) return null

  return createPortal((
    <>
      <div
        style={{
          position: "absolute",
          left: `${position.left}px`,
          top: `${position.top}px`,
          backgroundColor: "rgba(0, 0, 255, 0.1)",
          border: "1px dashed blue",
          pointerEvents: "none",
          width: `${position.width}px`,
          height: `${position.height}px`,
          zIndex: 12,
          borderRadius: 4,
          boxSizing: 'border-box',
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${position.labelLeft}px`,
          top: `${position.labelTop}px`,
          fontSize: "14px",
          zIndex: 13,
          display: (!position.width || position.width < 10) ? "none" : "inline",
          transform: 'translate(-100%, -100%)',
        }}
      >
        <Space>
          <Dropdown
            menu={{
              items: parentComponents.map(item => ({
                key: item.id,
                label: item.desc,
              })),
              onClick: ({ key }) => {
                setCurComponentId(+key)
              }
            }}
            disabled={parentComponents.length === 0}
          >
            <div
              style={{
                padding: '0 8px',
                backgroundColor: 'blue',
                borderRadius: 4,
                color: '#fff',
                cursor: "pointer",
                whiteSpace: 'nowrap',
              }}
            >
              {curSelectedComponent?.desc}
            </div>
          </Dropdown>
          {/* 渲染 curComponentId 对应的 SelectedMask */}
          {/* id 不为 1，说明不是 Page 组件，就显示删除按钮 */}
          {curComponentId !== 1 && (
            <div style={{ padding: '0 8px', backgroundColor: 'blue', borderRadius: 4 }}>
              <Popconfirm
                title="确认删除？"
                okText={'确认'}
                cancelText={'取消'}
                onConfirm={handleDelete}
              >
                <DeleteOutlined style={{ color: '#fff', cursor: 'pointer' }} />
              </Popconfirm>
            </div>
          )}
        </Space>
      </div>
    </>
  ), el)
}

export default SelectedMask