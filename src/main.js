import './assets/base.scss'
//cookies
import  VueCookies  from 'vue-cookies'
//element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import '@/assets/icon/iconfont.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
//全局方法
import Verify from './utils/Verify'
import Message from './utils/Message'
import Request from './utils/Request'
import Utils from './utils/Utils.js'
import Confirm from './utils/Confirm'
//全局组件
import Dialog from '@/components/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import Cover from '@/components/Cover.vue'
import DataList from '@/components/DataList.vue'
import ImageViewer from '@/components/ImageViewer.vue'
import EditorHtml from '@/components/EditorHtml.vue'
import EditorMarkdown from '@/components/EditorMarkdown.vue'
import CoverUpload from '@/components/CoverUpload.vue'
import AttachmentSelector from '@/components/AttachmentSelector.vue'
const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(store)
app.config.globalProperties.VueCookies = VueCookies;

app.config.globalProperties.Verify=Verify
app.config.globalProperties.Message=Message
app.config.globalProperties.Request=Request
app.config.globalProperties.Utils=Utils
app.config.globalProperties.Confirm=Confirm

app.config.globalProperties.globalInfo={
    bodyWidth:1300,
    avatarUrl:"/api/file/getAvatar/",
    imageUrl:'/api/file/getImage/'
}
app.component("Dialog",Dialog)
app.component("Avatar",Avatar)
app.component("Cover",Cover)
app.component("DataList",DataList)
app.component("ImageViewer",ImageViewer)
app.component("EditorHtml",EditorHtml)
app.component("EditorMarkdown",EditorMarkdown)
app.component("CoverUpload",CoverUpload)
app.component("AttachmentSelector",AttachmentSelector)
app.mount('#app')
