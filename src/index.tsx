import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { USER_INFO_KEY } from '@/constants';

// 开发预览按需安装跨域元素审查运行时，生产构建不会加载该模块。rsbuild和vite都支持
if (import.meta.env.DEV) {
  // The development authorization mock needs a local identity so the existing SSO guard does not redirect.
  if (!sessionStorage.getItem(USER_INFO_KEY)) {
    sessionStorage.setItem(USER_INFO_KEY, JSON.stringify({ userId: 'demo.admin', userName: '演示管理员', userNo: 'demo.admin' }));
  }
  void import('../devtools/elementInspector').then(({ installElementInspector }) => {
    installElementInspector();
  });
}

// TODO: 接入行内埋点库时取消注释
// import cmbTrackLib from "@lf12.32/front-web-lib";
// cmbTrackLib.init({
//   apiHost: process.env.TRACKING_API_HOST,
//   uploadID: process.env.TRACKING_UPLOAD_ID,
//   apiTrackHost: process.env.TRACKING_API_TRACK_HOST,
//   apiInvoke: true,
//   requestTrackAll: true,
//   batchSend: true,
//   ignoreChromeExtensionError: true,
// });

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
