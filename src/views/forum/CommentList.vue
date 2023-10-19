<template>
    <div class="comment-body">
        <div class="comment-title">
            <div class="title">评论<span class="count">{{commentListInfo.totalCount}}</span></div>
            <div class="tab">
                <span @click="orderChange(0)" :class="['tab-item',orderType==0?'active':'']">热榜</span>
                <el-divider direction="vertical" />
                <span @click="orderChange(1)" :class="['tab-item',orderType==1?'active':'']">最新</span>
            </div>
        </div>
        <!-- 发表评论 -->
        <div class="comment-form-panel">
            <CommentPost 
                :avatarWidth="50" 
                :avatarHeight="50" 
                :userId="currentUserInfo.userId"
                :showInsertImg="currentUserInfo.userId != null" 
                :articleId="articleId" 
                :pCommentId="0" 
                @postCommentFinish="postCommentFinish"></CommentPost>
        </div>
        <div class="comment-list">
            <DataList :dataSource="commentListInfo" :loading="loading" @loadData="loadComment" n>
                <template #default="{ data }">
                    <CommentListItem 
                    :articleId="articleId"
                    :commentData="data" 
                    :articleUserId="articleUserId"
                    :currentUserId="currentUserInfo.userId"
                    @hiddenAllReply="hiddenAllReplyHandler"
                    @reloadData="loadComment"></CommentListItem>
                </template>
            </DataList>
        </div>
    </div>
</template>

<script setup>
import CommentPost from './CommentPost.vue';
import CommentListItem from './CommentListItem.vue'
import { ref, reactive, getCurrentInstance, nextTick, watch, onMounted } from "vue"
const { proxy } = getCurrentInstance();
import { useStore } from 'vuex';
const store = useStore()
const props = defineProps({
    articleId: {
        type: String
    },
    articleUserId: {
        type: String
    }
})
const api = {
    loadComment: "/comment/loadComment",
    postComment: "/comment/postComment",
    doLike: "/comment/doLike",
    changeTopType: "/comment/changeTopType"
}
onMounted(() => {
    loadComment()
}
)

//排序
const orderType = ref(0)
const orderChange=(type)=>{
    orderType.value=type
    loadComment()
}
//评论列表
const commentListInfo = ref({})
const loading = ref(null)
const loadComment = async () => {
    let params = {
        pageNo: commentListInfo.value.pageNo,
        articleId: props.articleId,
        orderType: orderType.value
    }
    loading.value = true
    let res = await proxy.Request({
        url: api.loadComment,
        params,
        showLoading:false
    })
    loading.value = false
    if (!res) {
        return
    }
    commentListInfo.value = res.data
}
//当前用户信息
const currentUserInfo = ref({})
watch(() => store.state.loginUserInfo, (newVal, oldVal) => {
    currentUserInfo.value = newVal || {}
}, { immediate: true, deep: true });

//隐藏所有评论
const hiddenAllReplyHandler=()=>{
    commentListInfo.value.list.forEach((element)=>{
        element.showReply=false
    })
}

const emit=defineEmits(['updateCommentCount'])
const postCommentFinish=(resultData)=>{
    commentListInfo.value.list.unshift(resultData)
    const totalCount=commentListInfo.value.totalCount+1
    commentListInfo.value.totalCount=totalCount
    emit('updateCommentCount',totalCount)
}
</script>

<style lang="scss">
.comment-body {
    .comment-title {
        display: flex;
        align-items: center;

        .title {
            font-size: 20px;

            .count {
                font-size: 14px;
                padding: 0px 10px;
            }
        }
        .tab{
            .tab-item{
                cursor: pointer;
            }
            .active{
                color:#409eff ;
            }
        }
    }

    .comment-form-panel {
        margin-top: 20px;
    }
}
</style>
