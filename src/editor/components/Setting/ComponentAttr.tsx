import { Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { ComponentConfig, ComponentSetter, useComponentConfigStore } from '../../stores/component-config';
import { useComponetsStore } from '../../stores/components';

export function ComponentAttr() {

  const [form] = Form.useForm();

  const { curComponentId, curComponent, updateComponentProps } = useComponetsStore();
  const { componentConfig } = useComponentConfigStore();

  useEffect(() => {
    const data = form.getFieldsValue();
    // 当 curComponent 变化的时候，把 props 设置到表单用于回显数据
    form.setFieldsValue({...data, ...curComponent?.props});
  }, [curComponent])

  //  curComponentId 为 null，也就是没有选中组件的时候，返回 null
  if (!curComponentId || !curComponent) return null;
  
  function renderFormElememt(setting: ComponentSetter) {
    const { type, options } = setting;
  
    // 表单项目，分别渲染 id、name、desc 属性，还有组件对应的 setter
    if (type === 'select') {
      return <Select options={options} />
    } else if (type === 'input') {
      return <Input />
    }
  }

  function valueChange(changeValues: ComponentConfig) {
    if (curComponentId) {
        // 当表单 value 变化的时候，同步到 store
      updateComponentProps(curComponentId, changeValues);
    }
  }

  return (
    <Form
      form={form}
      onValuesChange={valueChange as any}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 14 }}
    >
      <Form.Item label="组件id">
        <Input value={curComponent.id} disabled />
      </Form.Item>
      <Form.Item label="组件名称">
        <Input value={curComponent.name} disabled />
      </Form.Item>
      <Form.Item label="组件描述">
        <Input value={curComponent.desc} disabled/>
      </Form.Item>
      {
        componentConfig[curComponent.name]?.setter?.map(setter => (
          <Form.Item key={setter.name} name={setter.name} label={setter.label}>
            {renderFormElememt(setter)}
          </Form.Item>
        ))
      }
    </Form>
  )
}
