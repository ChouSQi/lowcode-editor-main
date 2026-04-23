import { useEffect, useRef } from "react"
import { useDrag } from "react-dnd"

export interface MaterialItemProps {
    name: string
    desc: string
}

export function MaterialItem(props: MaterialItemProps) {
    const ref = useRef<HTMLDivElement>(null)
    const {
        name,
        desc
    } = props
    // 给每个 item 添加 useDrag 实现拖拽
    const [{ isDragging }, drag] = useDrag({
        // type 是当前 drag 的元素的标识，drop 的时候根据这个来决定是否 accept
        type: name,
        // item 是传递的数据
        item: { type: name },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    useEffect(() => {
        if (ref.current) {
            drag(ref.current)
        }
    }, [drag])

    return (
        <div
            ref={ref}
            className="
                border-dashed
                border-[1px]
                border-[#000]
                py-[8px] px-[10px] 
                m-[10px]
                cursor-move
                inline-block
                bg-white
                hover:bg-[#ccc]
            "
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            {desc}
        </div>
    )
}