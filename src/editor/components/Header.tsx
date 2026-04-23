import { Button, Space, Popconfirm } from 'antd';
import { UndoOutlined, RedoOutlined, FolderOpenOutlined, DeleteOutlined } from '@ant-design/icons';
import { useComponetsStore } from '../stores/components';
import { useEffect, useState } from 'react';
import { TemplateManager } from './TemplateManager';

export function Header() {

  const { mode, setMode, setCurComponentId, undo, redo, past, future } = useComponetsStore();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return (
    <div className='w-[100%] h-[100%]'>
      <div className='h-[50px] flex justify-between items-center px-[20px]'>
        <div>低代码编辑器</div>
        <Space>
          {mode === 'edit' && (
            <>
              <Button icon={<UndoOutlined />} disabled={past.length === 0} onClick={undo}>撤销</Button>
              <Button icon={<RedoOutlined />} disabled={future.length === 0} onClick={redo}>重做</Button>
              <Button icon={<FolderOpenOutlined />} onClick={() => setTemplateModalOpen(true)}>
                模板管理
              </Button>
              <Popconfirm
                title="确定清空页面吗？"
                description="这将删除所有组件并清空本地存储，操作不可撤销。"
                onConfirm={() => {
                  localStorage.clear()
                  useComponetsStore.setState({
                    components: [{ id: 1, name: 'Page', props: {}, desc: '页面' }],
                    curComponentId: null,
                    curComponent: null,
                    past: [],
                    future: [],
                  })
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button icon={<DeleteOutlined />} danger>
                  清空页面
                </Button>
              </Popconfirm>
              <Button
                  onClick={() => {
                      setMode('preview');
                      setCurComponentId(null);
                  }}
                  type='primary'
              >
                  预览
              </Button>
            </>
          )}
          {mode === 'preview' && (
            <Button
              onClick={() => { setMode('edit') }}
              type='primary'
            >
              退出预览
            </Button>
          )}
        </Space>
      </div>
      <TemplateManager open={templateModalOpen} onClose={() => setTemplateModalOpen(false)} />
    </div>
  )
}
