import { useState, useRef } from 'react'
import { Modal, Table, Button, Space, Input, message, Popconfirm } from 'antd'
import { DownloadOutlined, UploadOutlined, DeleteOutlined, FolderOpenOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTemplatesStore, Template } from '../stores/templates'
import { useComponetsStore } from '../stores/components'

interface TemplateManagerProps {
  open: boolean
  onClose: () => void
}

export function TemplateManager({ open, onClose }: TemplateManagerProps) {
  const { templates, saveAsTemplate, deleteTemplate, loadTemplate, exportTemplate, importTemplate, exportAllTemplates, importAllTemplates } = useTemplatesStore()
  const { components } = useComponetsStore()
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDesc, setTemplateDesc] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importAllRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    if (!templateName.trim()) {
      message.warning('请输入模板名称')
      return
    }
    console.log('保存模板，components:', components)
    saveAsTemplate(templateName.trim(), components, templateDesc.trim() || undefined)
    message.success('保存成功')
    setSaveModalOpen(false)
    setTemplateName('')
    setTemplateDesc('')
  }

  const handleLoad = (record: Template) => {
    const loaded = loadTemplate(record.id)
    if (loaded.length > 0) {
      useComponetsStore.getState().past.push(JSON.parse(JSON.stringify(components)))
      useComponetsStore.setState({ components: loaded, past: [...useComponetsStore.getState().past], future: [], curComponentId: null, curComponent: null })
      message.success('加载成功')
      onClose()
    }
  }

  const handleImportFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        importTemplate(event.target?.result as string)
        message.success('导入成功')
      } catch {
        message.error('导入失败，文件格式不正确')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImportAll = () => {
    importAllRef.current?.click()
  }

  const handleImportAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        importAllTemplates(event.target?.result as string)
        message.success('批量导入成功')
      } catch {
        message.error('导入失败，文件格式不正确')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: Template) => (
        <Space>
          <Button type='link' icon={<FolderOpenOutlined />} onClick={() => handleLoad(record)}>
            加载
          </Button>
          <Button type='link' icon={<DownloadOutlined />} onClick={() => exportTemplate(record.id)}>
            导出
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => deleteTemplate(record.id)}>
            <Button type='link' danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Modal
        title="模板管理"
        open={open}
        onCancel={onClose}
        width={800}
        footer={null}
      >
        <Space style={{ marginBottom: 16 }}>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => setSaveModalOpen(true)}>
            另存为模板
          </Button>
          <Button icon={<UploadOutlined />} onClick={handleImportFile}>
            导入模板
          </Button>
          <Button icon={<UploadOutlined />} onClick={handleImportAll}>
            批量导入
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportAllTemplates}>
            全部导出
          </Button>
        </Space>
        <input ref={fileInputRef} type='file' accept='.json' style={{ display: 'none' }} onChange={handleFileChange} />
        <input ref={importAllRef} type='file' accept='.json' style={{ display: 'none' }} onChange={handleImportAllChange} />
        <Table dataSource={templates} columns={columns} rowKey='id' pagination={false} />
      </Modal>
      <Modal
        title="保存为模板"
        open={saveModalOpen}
        onOk={handleSave}
        onCancel={() => setSaveModalOpen(false)}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 4 }}>模板名称</div>
          <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder='请输入模板名称' />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>模板描述</div>
          <Input.TextArea value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)} placeholder='请输入模板描述（可选）' rows={3} />
        </div>
      </Modal>
    </>
  )
}
