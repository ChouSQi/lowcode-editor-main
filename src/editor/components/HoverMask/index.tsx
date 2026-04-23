import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { getComponentById, useComponetsStore } from '../../stores/components'

// 需要传入 containerClassName 和 componentId 参数
interface HoverMaskProps {
  portalWrapperClassName: string,
  containerClassName: string,
  componentId: number
}
// componentId 就是 hover 的组件 id，而 containerClassName 就是画布区的根元素的 className

// 计算按钮和画布区顶部的距离，就需要按钮的 boundingClientRect 还有画布区的 boundingClientRect
function HoverMask({ containerClassName, portalWrapperClassName,componentId }: HoverMaskProps) {
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    labelTop: 0,
    labelLeft: 0,
  })
  
  const { components } = useComponetsStore()

  useEffect(() => {
    // 声明 left、top、width、height 的 state，调用 updatePosition 来计算这些位置
    function updatePosition() {
      if (!componentId) return

      const container = document.querySelector(`.${containerClassName}`)
      if (!container) return

      const node = document.querySelector(`[data-component-id="${componentId}"]`)
      if (!node) return

      const { top, left, width, height } = node.getBoundingClientRect()
      const { top: containerTop, left: containerLeft } = container.getBoundingClientRect()

      // 获取两个元素的 boundingClientRect，计算 top、left 的差值，加上 scrollTop、scrollLeft
      let labelTop = top - containerTop + container.scrollTop
      const labelLeft = left - containerLeft + width

      if(labelTop <= 0){
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
  }, [componentId, containerClassName]) // 添加正确的依赖

  const el = useMemo(() => {
    const el = document.createElement('div')
    el.className = 'wrapper'
    const container = document.querySelector(`.${portalWrapperClassName}`)
    if (container) {
      container.appendChild(el)
    }
    return el
  }, [portalWrapperClassName])

  if (!el) return null

  const curComponent = useMemo(() => {
  return getComponentById(componentId, components)
}, [componentId, components]) // ✅ 添加 components 依赖

  return createPortal((
    <>
      <div
        style={{
          position: "absolute",
          left: position.left,
          top: position.top,
          backgroundColor: "rgba(0, 0, 255, 0.05)",
          border: "1px dashed blue",
          pointerEvents: "none",
          width: position.width,
          height: position.height,
          zIndex: 12,
          borderRadius: 4,
          boxSizing: 'border-box',
        }}
      />
      <div
          style={{
            position: "absolute",
            left: position.labelLeft,
            top: position.labelTop,
            fontSize: "14px",
            zIndex: 13,
            display: (!position.width || position.width < 10) ? "none" : "inline",
            transform: 'translate(-100%, -100%)',
          }}
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
            {curComponent?.desc}
          </div>
        </div>
    </>
  ), el)
}

export default HoverMask