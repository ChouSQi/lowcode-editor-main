import { useState } from 'react'
import { Card, Button, List, Space, Tooltip } from 'antd'
import { UndoOutlined, RedoOutlined, CloseOutlined, HistoryOutlined } from '@ant-design/icons'
import { useComponetsStore } from '../stores/components'

export function HistoryPanel() {
  const { past, future, undo, redo } = useComponetsStore()
  const [collapsed, setCollapsed] = useState(false)

  const handleJump = (index: number) => {
    const steps = past.length - index - 1
    if (steps > 0) {
      for (let i = 0; i < steps; i++) {
        undo()
      }
    } else if (steps < 0) {
      for (let i = 0; i < -steps; i++) {
        redo()
      }
    }
  }

  if (collapsed) {
    return (
      <div style={{ position: 'fixed', left: 20, bottom: 20, zIndex: 100 }}>
        <Tooltip title="展开历史面板">
          <Button
            type="primary"
            shape="circle"
            icon={<HistoryOutlined />}
            onClick={() => setCollapsed(false)}
          />
        </Tooltip>
      </div>
    )
  }

  const historyItems = [
    ...past.map((state, index) => ({
      type: 'past' as const,
      index,
      label: `步骤 ${index + 1}`,
      componentCount: state.length > 0 ? (state[0]?.children ? state[0].children.length + 1 : 1) : 0,
    })),
    {
      type: 'current' as const,
      label: '当前状态',
      componentCount: useComponetsStore.getState().components.length > 0 
        ? (useComponetsStore.getState().components[0]?.children 
            ? useComponetsStore.getState().components[0].children!.length + 1 
            : 1)
        : 0,
    },
    ...future.map((state, index) => ({
      type: 'future' as const,
      index,
      label: `重做 ${index + 1}`,
      componentCount: state.length > 0 ? (state[0]?.children ? state[0].children.length + 1 : 1) : 0,
    })),
  ]

  return (
    <div style={{ position: 'fixed', left: 20, bottom: 20, zIndex: 100, width: 280 }}>
      <Card
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <span>历史记录</span>
            <Space>
              <Button
                type="text"
                size="small"
                icon={<UndoOutlined />}
                disabled={past.length === 0}
                onClick={undo}
              />
              <Button
                type="text"
                size="small"
                icon={<RedoOutlined />}
                disabled={future.length === 0}
                onClick={redo}
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => setCollapsed(true)}
              />
            </Space>
          </Space>
        }
        size="small"
      >
        <List
          size="small"
          dataSource={historyItems}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '4px 8px',
                cursor: item.type !== 'current' ? 'pointer' : 'default',
                backgroundColor: item.type === 'current' ? '#f0f0f0' : 'transparent',
                borderRadius: 4,
              }}
              onClick={() => {
                if (item.type === 'past') {
                  handleJump(item.index)
                } else if (item.type === 'future') {
                  const steps = item.index + 1
                  for (let i = 0; i < steps; i++) {
                    redo()
                  }
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>
                  {item.type === 'past' && '↶ '}
                  {item.type === 'future' && '↷ '}
                  {item.label}
                </span>
                <span style={{ color: '#666', fontSize: '12px' }}>
                  {item.componentCount} 个组件
                </span>
              </div>
            </List.Item>
          )}
        />
        <div style={{ marginTop: 8, fontSize: '12px', color: '#999', textAlign: 'center' }}>
          共 {past.length} 步可撤销，{future.length} 步可重做
        </div>
      </Card>
    </div>
  )
}
