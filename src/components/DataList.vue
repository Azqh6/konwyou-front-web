<template>
    <div v-if="!loading&&dataSource.list!=null&&dataSource.list.length==0">
        暂无数据
    </div>
    <div class="skeleton" v-if="loading">
        <el-skeleton :row="2" animated></el-skeleton>
    </div>
    <div v-for="item in dataSource.list" v-if="!loading">
        <slot :data="item"></slot>
    </div>
  <div class="paginatuin">
    <el-pagination
      v-if="dataSource.pageTotal>1"
      background
      :total="dataSource.totalCount"
      :current-page.sync="dataSource.pageNo"
      layout="prev,pager,next"
      @current-change="handlePageNoChange"
      style="text-align: center;"
      :page-size="15"
    >

    </el-pagination>
  </div>
</template>

<script setup>
const props=defineProps({
    dataSource:{
        type:Object
    },
    loading:{
        type:Boolean
    }
})
const emit=defineEmits(["loadData"])
const handlePageNoChange=(pageNo)=>{
    props.dataSource.pageNo=pageNo
    emit("loadData")
}
</script>

<style lang="scss">
.paginatuin{
   padding: 10px 0px 10px 10px;
}
.skeleton{
    padding: 15px;
}
</style>
