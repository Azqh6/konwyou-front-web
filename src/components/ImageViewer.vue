<template>
  <div class="image-viewr">
    <el-image-viewer
        :initial-index="previewImgIndex"
        hide-on-click-modal
        :url-list="imageList"
        @close="closeImgViewer"
        v-if="previewImgIndex!=null"
    >

    </el-image-viewer>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
const { proxy } = getCurrentInstance();
const props=defineProps({
    imageList:{
        type:Array
    }
})
const previewImgIndex=ref(null)
const show=(index)=>{
    stopScroll()
    previewImgIndex.value=index
}
defineExpose({show})
const closeImgViewer=()=>{
    previewImgIndex.value=null
}
//关闭滚动
const stopScroll=()=>{
    starScroll()
    document.body.style.overflow='hidden'
}
//开始滚动
const starScroll=()=>{
    document.body.style.overflow='auto'
}
</script>

<style lang="scss" scoped>
</style>
