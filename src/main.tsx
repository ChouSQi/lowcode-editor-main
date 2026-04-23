import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

ReactDOM.createRoot(document.getElementById('root')!).render(
    // 这个是 react-dnd 用来跨组件传递数据的
    <DndProvider backend={HTML5Backend}>
            <App />
        </DndProvider>
    )