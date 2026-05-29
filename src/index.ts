import type { App } from 'vue';
// @ts-ignore 忽略JS文件的类型检查，解决隐式any类型报错
import VueSignatureCanvas from './components/VueSignatureCanvas';

VueSignatureCanvas.install = (app: App) => {
  app.component(
    VueSignatureCanvas.name || 'VueSignatureCanvas',
    VueSignatureCanvas,
  );
};

export default VueSignatureCanvas;
