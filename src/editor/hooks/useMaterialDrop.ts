// hooks/useMaterialDrop.ts
import { useDrop } from "react-dnd"
import { useComponentConfigStore } from "../stores/component-config"
import { useComponetsStore } from "../stores/components"
import { getComponentById } from "../stores/components";

export interface ItemType {
  type: string;
  dragType?: 'move' | 'add',
  id: number
}

export function useMaterailDrop(accept: string[], id: number) {
    const { addComponent, deleteComponent, components } = useComponetsStore();
    const { componentConfig } = useComponentConfigStore();

    const [{ canDrop }, drop] = useDrop(() => ({
        accept,
        drop: (item: ItemType, monitor) => {
            const didDrop = monitor.didDrop()
            if (didDrop) return;

            if(item.dragType === 'move') {
              const component = getComponentById(item.id, components)!;
              deleteComponent(item.id);
              addComponent(component, id)
              return;
            }
            
            // 添加新组件
            const config = componentConfig[item.type];
            
            // ✅ 动态生成 props（特别是 FormItem 的 name）
            let dynamicProps = { ...config.defaultProps }
            
            if (item.type === 'FormItem') {
              dynamicProps = {
                ...dynamicProps,
                name: new Date().getTime(),  // 每次添加都生成新的唯一 name
              }
            }
            
            addComponent({
              id: new Date().getTime(),
              name: item.type,
              desc: config.desc,
              props: dynamicProps
            }, id)
        },
        collect: (monitor) => ({
          canDrop: monitor.canDrop(),
        }),
    }));

    return { canDrop, drop }
}