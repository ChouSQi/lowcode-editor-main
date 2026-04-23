import { Modal as AntdModal } from 'antd'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { CommonComponentProps } from '../../interface'

export interface ModalRef {
    open: () => void
    close: () => void
}

// 1. 排除 ref，因为 forwardRef 会单独处理
type ModalProps = Omit<CommonComponentProps, 'ref'>

const Modal: React.ForwardRefRenderFunction<ModalRef, ModalProps> = ({ 
    children, 
    title, 
    onOk, 
    onCancel, 
    styles 
}, ref) => {

    const [open, setOpen] = useState(false)

    useImperativeHandle(ref, () => {
        return {
            open: () => {
                setOpen(true)
            },
            close: () => {
                setOpen(false)
            }
        }
    }, [])

    return (
        <AntdModal
            title={title}
            style={styles}
            open={open}
            onCancel={() => {
                onCancel?.()  // ✅ 使用可选链
                setOpen(false)
            }}
            onOk={() => {
                onOk?.()  // ✅ 使用可选链
            }}
            destroyOnClose
        >
            {children}
        </AntdModal>
    )
}

export default forwardRef(Modal)