/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonComponentProps } from "../../interface"
import { useMaterailDrop } from "../../hooks/useMaterialDrop"

function Page({ id, name, children, styles }: CommonComponentProps) {

    const { canDrop, drop } = useMaterailDrop(['Button', 'Container', 'Modal', 'Table', 'Form'], id)

    return (
        <div
            data-component-id={id}
            ref={(node) => {
                if (node) {
                    drop(node)
                }
            }}
            className='p-[20px] h-[100%] box-border'
            style={{ ...styles, border: canDrop ? '2px solid blue' : 'none' }}
        >
            {children}
        </div>
    )
}

export default Page