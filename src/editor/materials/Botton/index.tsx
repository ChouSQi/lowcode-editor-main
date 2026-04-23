import { Button as AntdButton } from 'antd'
import { CommonComponentProps } from '../../interface'
import { useDrag } from 'react-dnd'

const Button = ({ id, type, text, styles }: CommonComponentProps) => {

  const [{ isDragging }, drag] = useDrag({
    type: 'Button',
    item: {
        type: 'Button',
        id: id,
        text: text,
        dragType: 'move'
    },
    collect: (monitor) => ({
        isDragging: monitor.isDragging()
    })
  })

  return (
    <AntdButton 
        ref={(node) => {
            if (node) {
                drag(node)
            }
        }}
        data-component-id={id} 
        type={type} 
        style={{ ...styles, opacity: isDragging ? 0.5 : 1 }}
    >
        {text}
    </AntdButton>
  )
}

export default Button