<template>
  <v-md-editor
    :model-value="modelValue"
    :height="height + 'px'"
    :disabled-menus="[]"
    :include-level="[1,2,3,4,5,6]"
    @upload-image="uploadImageHandler"
    @change="change"
  >

  </v-md-editor>
</template>

<script setup>
import "@kangc/v-md-editor/lib/style/base-editor.css"
import "@kangc/v-md-editor/lib/theme/style/github.css"
import VMdEditor from '@kangc/v-md-editor'
import githubTheme from "@kangc/v-md-editor/lib/theme/github.js"
import hljs from "highlight.js"
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
import {useRouter,useRoute} from 'vue-router'
const { proxy } = getCurrentInstance();
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
VMdEditor.use(githubTheme,{
    Hljs:hljs
})

const emit=defineEmits()
const change=(markdownContent,htmlContent)=>{
    emit("update:modelValue",markdownContent)
    emit("htmlContent",htmlContent)
}
const uploadImageHandler=async(event,insertImage,files)=>{
    let res=await proxy.Request({
        url:'file/uploadImage',
        params:{
            file:files[0]
        }
    })
    if(!res){
        return
    }
    const url=proxy.globalInfo.imageUrl+res.data.fileName
    insertImage({
        url:url,
        desc:'图片'
    })
}
</script>

<style lang="scss" scoped>
</style>
