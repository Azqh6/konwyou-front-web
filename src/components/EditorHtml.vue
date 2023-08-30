<template>
  <div class="editor-html">
    <Toolbar
        style="border-bottom:1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    >
    </Toolbar>
    <Editor 
        :style="{height:height+'px','overflow-y':'hidden'}"
        :model-value="modelValue"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="onChange"
    >

    </Editor>
  </div>
</template>

<script setup>
import {Editor,Toolbar} from '@wangeditor/editor-for-vue'
import "@wangeditor/editor/dist/css/style.css"
import { useStore } from "vuex";
import { ref, reactive, getCurrentInstance, nextTick,shallowRef,onBeforeUnmount } from "vue"
const { proxy } = getCurrentInstance();
const store=useStore()
const props =defineProps({
    modelValue:{
        type:String,
        default:''
    },
    height:{
        type:Number,
        default:500
    }
})
const mode=ref("default")
const editorRef=shallowRef()
const toolbarConfig={
    excludeKeys:[
        "uploadVideo"
    ]
}
const editorConfig={
    placeholder:'请输入内容...',
    excludeKeys:["uploadVideo"],
    MENU_CONF:{
        uploadImage:{
            maxFileSize:3*1024*1024,
            server:"/api/file/uploadImage",
            fieldName:'file',
            customInsert(responseData,insertFn){
                if(responseData.code==200){
                    insertFn(
                        proxy.globalInfo.imageUrl+responseData.data.fileName,
                        "",
                        ""
                    )
                    return
                }else if(responseData.code==901){
                    store.commit("showLogin",true)
                    store.commit("updateLoginUserInfo",null)
                    return
                }
                proxy.Message.error(responseData.info)
            }
        }
    }
}

const emit=defineEmits()
const onChange=(editor)=>{
    emit("update:modelValue",editor.getHtml())

}

//组件销毁及时销毁编辑器
 onBeforeUnmount(() => {
    const editor=editorRef.value
    if(editor==null)return
    editor.destroy()
 })

 const handleCreated=(editor)=>{
    editorRef.value=editor//记录editor实例
 }
</script>

<style lang="scss" scoped>
.editor-html{
    border: 1px solid #ddd;
}
</style>
