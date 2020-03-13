import VueSignatureCanvas from './components/VueSignatureCanvas';

VueSignatureCanvas.install = Vue =>
  Vue.component(VueSignatureCanvas.name, VueSignatureCanvas);

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueSignatureCanvas);
}

export default VueSignatureCanvas;
