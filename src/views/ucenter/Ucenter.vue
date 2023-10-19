<template>
  <div class="container-body ucenter" 
    :style="{width:proxy.globalInfo.bodyWidth+'px'}">
      <div class="user-banner">
        <rourer-link to="/" class="a-link">首页</rourer-link>
        <span class="iconfont icon-right"></span>
        <span>个人中心</span>
      </div>
      <div class="ucenter-panel">
        <div class="user-side">
          <!-- 头像信息 -->
          <div class="avatar-panel">
            <div class="edit-btn a-link" v-if="isCurrentUser" @click="updateUserInfo">修改资料</div>
            <div class="avatar-inner">
              <Avatar :userId="userInfo.userId" :width="120" :height="120"></Avatar>
            </div>
            <div class="nick-name">
              <span>{{ userInfo.nickName }}</span>
              <span v-if="userInfo.sex==0" class="iconfont icon-woman"></span>
              <span v-if="userInfo.sex==1" class="iconfont icon-man"></span>
            </div>
            <div class="desc">
              {{userInfo.personDescription}}
            </div>
          </div>
          <!-- 扩展信息 -->
          <div class="user-extend-panel">
            <div class="info-item">
              <div class="label iconfont icon-integral" >积分</div>
              <div class="value a-link" v-if="isCurrentUser">{{userInfo.currentIntegral}}</div>
              <div class="value " v-else>{{userInfo.currentIntegral}}</div>
            </div>
            <div class="info-item">
              <div class="label iconfont icon-like">获赞</div>
              <div class="value">{{userInfo.likeCount}}</div>
            </div>
            <div class="info-item">
              <div class="label iconfont icon-post">发帖</div>
              <div class="value">{{userInfo.postCount}}</div>
            </div>
            <div class="info-item">
              <div class="label iconfont icon-register">加入</div>
              <div class="value">{{userInfo.joinTime}}</div>
            </div>
            <div class="info-item">
              <div class="label iconfont icon-login">最后登录</div>
              <div class="value">{{userInfo.lastLoginTime}}</div>
            </div>
          </div>
        </div>
        <div class="article-panel">
          <el-tabs :model-value="activeTabName" @tab-change="changeTab">
            <el-tab-pane label="发帖" :name="0"></el-tab-pane>
            <el-tab-pane label="评论" :name="1"></el-tab-pane>
            <el-tab-pane label="点赞" :name="2"></el-tab-pane>
          </el-tabs>
          <div class="article-list">
            <DataList :loading="loading" :dataSource="articleListInfo" @loadData="loadArticle">
                  <template #default="{data}">
                    <ArticleListItem :data="data" :showEdit="activeTabName==0&&isCurrentUser" :showComment="showComment"></ArticleListItem>
                  </template>
           </DataList>
          </div>
        </div>
      </div>
      <UcenterEditUserInfo ref="UcenterEditUserInfoRef" @resetUserInfo="resetUserInfoHandler"></UcenterEditUserInfo>
    </div>
</template>

<script setup>
import UcenterEditUserInfo from './UcenterEditUserInfo.vue'
import ArticleListItem from '@/views/forum/ArticleListItem.vue'
import { ref, reactive, getCurrentInstance, nextTick,onMounted ,watch} from "vue"
import { useRouter,useRoute } from "vue-router";
import { useStore } from "vuex";
const store=useStore()
const router=useRouter()
const route=useRoute()
const { proxy } = getCurrentInstance();
const api={
  getUserInfo:"/ucenter/getUserInfo",
  loadUserArticle:"/ucenter/loadUserArticle"
}
 const isCurrentUser=ref(false)
 
const userId=ref(null)
const userInfo=ref({})
const loadUserInfo=async()=>{
  let res=await proxy.Request({
    url:api.getUserInfo,
    params:{
      userId:userId.value
    },
    errorCallback:()=>{
      setTimeout(()=>{
        router.push('/')
      },1500)
    }
  })
  if(!res){
    return
  }
  userInfo.value=res.data
}
//右侧文章
const activeTabName=ref(0)
const changeTab=(type)=>{
  activeTabName.value=type
  loadArticle()
}
const loading=ref(false)
const articleListInfo=ref({})
const loadArticle=async()=>{
  loading.value=true
  let params={
    pageNo:articleListInfo.value.pageNo,
    type:activeTabName.value,
    userId:userId.value
  }
  let res= await proxy.Request({
    url:api.loadUserArticle,
    params:params,
    showLoading:false
  })
  loading.value=false
  if(!res){
    return
  }
  articleListInfo.value=res.data
}




const resetCurrentUser=()=>{
  const loginUserInfo=store.getters.getLoginUserInfo
  if(loginUserInfo&& loginUserInfo.userId===userId.value){
    isCurrentUser.value=true
  }else{
    isCurrentUser.value=false
  }
 }
watch(() =>store.state.loginUserInfo, (newVal, oldVal) => {
  resetCurrentUser()
 }, { immediate: true, deep: true });
watch(() =>route.params.userId, (newVal, oldVal) => {
  if(newVal){
    userId.value=newVal
    resetCurrentUser()
    loadUserInfo()
    loadArticle()
  }
}, { immediate: true, deep: true });

//修改用户信息
const UcenterEditUserInfoRef=ref(null)
const updateUserInfo=()=>{
  UcenterEditUserInfoRef.value.showEditUserInfoDialog(userInfo.value)
}
const resetUserInfoHandler=(data)=>{
   userInfo.value=data
}
const showComment=ref(false)
 watch(() => store.state.sysSetting,(newVal, oldVal) => {
  if(newVal){
    showComment.value=newVal.commentOpen
  }
 }, { immediate: true, deep: true });
</script>

<style lang="scss">
  .ucenter{
    line-height: 35px;
    .user-banner{
      color: #9ba7b9;
      .icon-right{
        padding: 0px 5px;
      }
    }
    .ucenter-panel{
      display: flex;
      .user-side{
        width: 300px;
        margin-right: 10px;
        .avatar-panel{
          background: #fff;
          text-align: center;
          padding: 10px;
          .edit-btn{
            text-align: right;
            font-size: 14px;
          }
          .avatar-inner{
            display: flex;
            justify-content: center;
          }
          .nick-name{
            .iconfont{
              margin-left: 5px;
              color: var(--linkColor);
            }
          }
          .desc{
            margin-top: 5px;
            text-align: left;
            font-size: 14px;
            color: #929393;
          }
        }
        .user-extend-panel{
          margin-top: 10px;
          background: #fff;
          padding: 10px;
          .info-item{
            display: flex;
            justify-content: space-between;
            line-height: 30px;
            .label{
              font-size: 13px;
            }
            .label::before{
              font-size: 22px;
              color: #888888;
              padding-right: 5p;
            }
            .value{
              font-size: 15px;
            }
          }
        }
      }
      .article-panel{
        flex: 1;
        background: #fff;
        padding: 0px 10px 10px 10px;
      }
    }
  }
</style>
