import { Route } from '@/typings/workbench';

// TODO 菜单类型跟随antd
export const BIZ_MENUS: Route[] = [
  {
    path: 'firstLevel', // 有值则生成路由时作为父级路由，否则生成路由时不包含这一级路由
    name: '一级目录',
    icon: 'https://cmbjs.paas.cmbchina.cn/documents/documentIcon/ant-design.png',
    children: [
      {
        path: 'default', // 菜单点击后的跳转路径就是 /default
        name: '默认页面',
        key: 'DefaultPage' // 如果渲染的是特定页面，key必须存在，且与src/pages下面的page的引用地址保持一致，要让import Page from '@/pages/Page’是一个有效语句
      }
    ]
  },
  {
    path: 'https://www.baidu.com',
    name: '外部链接',
    icon: "GithubFilled",
    target: "_blank"
  }
];

export const SYSTEM_MENUS: Route[] = [
  {
    path: 'system',
    name: '系统管理',
    icon: 'SettingFilled',
    children: [
      {
        path: 'role',
        name: '角色授权',
        icon: 'UserOutlined',
        key: 'Role'
      }
    ]
  }
];
