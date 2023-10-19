<template>
  <div class="container-body " 
    :style="{width:proxy.globalInfo.bodyWidth+'px'}"
    v-if="Object.keys(articlInfo).length>0"
  >
    <!-- 板块导航 -->
    <div class="board-info">
      <router-link :to="`/forum/${articlInfo.pBoardId}`" class="a-link">
        {{articlInfo.pBoardName}}
      </router-link>
      <span class="iconfont icon-right"></span>
      <template v-if="articlInfo.boardId">
        <router-link :to="`/forum/${articlInfo.pBoardId}/${articlInfo.boardId}`" class="a-link">
        {{articlInfo.boardName}}
      </router-link>
      <span class="iconfont icon-right"></span>
      </template>
      <span>{{ articlInfo.title }}</span>
    </div>
    <!-- 文章详情 -->
    <div class="detail-container" style="width: 1000px;">
      <div class="article-detail">
        <!-- 标题 -->
        <div class="title">
          <span class="tag tag-no-audit" v-if="articlInfo.status==0" >待审核</span>
          {{articlInfo.title}}
         
        </div>
        <!-- 用户信息 -->
        <div class="user-info">
          <Avatar :userId="articlInfo.userId" :width="50" :height="50"></Avatar>
          <div class="user-info-detail">
            <div class="nick-name">
              {{articlInfo.nickName}}
            </div>
            <div class="time-info">
              <span>{{ articlInfo.postTime }}</span>
              <span class="address">
                &nbsp;· &nbsp;{{articlInfo.userIpAddress}}
              </span>
              <span class="iconfont icon-eye-solid">
                    {{articlInfo.readCount==0?"阅读":articlInfo.readCount}}
                </span>
                <router-link 
                  v-if="articlInfo.userId == currentUserInfo.userId"
                :to="`/editPost/${articlInfo.articleId}`" class="a-link">
                  <span class="iconfont icon-edit">编辑</span>
                </router-link>
            </div>
          </div>
        </div>
        <!-- 文章详情 -->
        <div class="detail" id="detail" v-html="articlInfo.content"></div>
       
      </div>
       <!-- 附件 -->
       <div class="attachment-panel" id="view-attachment" v-if="attachment">
        <div class="title">附件</div>
        <div class="attachment-info">
          <div class="iconfont icon-zip item"></div>
          <div class="file-name item">{{attachment.fileName}}</div>
          <div class="size item">{{proxy.Utils.sizeToStr(attachment.fileSize)}}</div>
          <div>
            需要<span class="integral ">{{attachment.integral}}</span>积分
          </div>
          <div class="download-count" style="margin: 0px 10px;">已下载{{attachment.downloadCount}}次</div>
          <div class="download-btn" se><el-button type="primary" size="small" @click="downLoadAttachment(attachment.fileId)">下载</el-button></div>
        </div>
      </div>
      <!-- 评论 -->
      <div class="comment-panel" id="view-comment" v-if="showComment && articlInfo.status==1">
        <CommentList :articleId="articlInfo.articleId" :articleUserId="articlInfo.userId" @updateCommentCount="updateCommentCount"></CommentList>
      </div>
    </div>
    <!-- 目录 -->
    <div class="toc-panel">
      <div class="top-containner">
        <div class="toc-title">目录</div>
        <div class="toc-list">
          <template v-if="tocArray.length==0">
            <div class="no-toc">未解析到目录</div>
          </template>
          <template v-else>
            <div v-for="toc in tocArray">
              <span :class="['toc-item',toc.id==anchorId?'active':'']" @click="gotoAnchor(toc.id)"
                :style="{'padding-left':toc.level*15+'px'}"
              >{{toc.title}}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
      <!-- 左侧快捷栏 -->
  <div class="quick-panel">
    <!-- 点赞 -->
    <el-badge
      :value="articlInfo.goodCount"
      type="info"
      :hidden="!articlInfo.goodCount>0"
    >
      <div class="quick-item"  @click="doLike">
        <span :class="['iconfont icon-good',haveLike?'have-like':'']"></span>
      </div>
    </el-badge>
    <!-- 评论 -->
    <el-badge
      :value="articlInfo.commentCount"
      type="info"
      :hidden="!articlInfo.commentCount>0"
      v-if="showComment"
    >
      <div class="quick-item" @click="goToPostion('view-comment')" v-if="showComment">
        <span class="iconfont icon-comment"></span>
      </div>
    </el-badge>
    <!-- 附件 -->
    <div class="quick-item" @click="goToPostion('view-attachment')">
        <span class="iconfont icon-attachment"></span>
      </div>
  </div>
  </div>

  <ImageViewer ref="imageViewerRef" :imageList="previewImgList"></ImageViewer>
</template>

<script setup>
//@ts-ignore
import CommentList from "./CommentList.vue";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css"
import { ref, reactive, getCurrentInstance, nextTick ,onMounted,onUnmounted,watch} from "vue"
import { useRoute,useRouter } from "vue-router";
import {useStore}from 'vuex'
let store=useStore()
const route=useRoute()
const router=useRouter()
const { proxy } = getCurrentInstance();
const api={
  getArticleDetail:"/forum/getArticleDetail",
  doLike:'/forum/doLike',
  getUserIntegral:"/forum/getUserDownloadInfo",
  attachmentDownload:"/api/forum/attachmentDownload"
}
 onMounted(() => {
  getArticleDetail(route.params.articleId)
  window.addEventListener("scroll",listenerScroll,false)
 })
  onUnmounted(() => {
    window.addEventListener("scroll",listenerScroll,false)
  })
  const currentUserInfo=ref({})
  watch(() =>store.state.loginUserInfo ,(newVal, oldVal) => {
    currentUserInfo.value=newVal || {}
  }, { immediate: true, deep: true });
//获取文章详情
const articlInfo=ref({})
//附件
const attachment=ref({})
//是否已经点赞
const haveLike=ref(false)
const getArticleDetail=async(articleId)=>{
  let res=await proxy.Request({
    url:api.getArticleDetail,
    params:{
      articleId:articleId
    }
  })
  if(!res){
    return
  }
  articlInfo.value=res.data.forumArticle
  attachment.value=res.data.attachment
  haveLike.value=res.data.haveLike
  store.commit('setActivePboardId',res.data.forumArticle.pBoardId)
  store.commit('setActiveBoardId',res.data.forumArticle.boardId)
  imagePreview()
  highlightCode()
  makeToc()
}
//快捷侧边栏点击事件
const goToPostion=(domId)=>{
    document.querySelector("#"+domId).scrollIntoView()
}
//点赞
const doLike=async()=>{
  if(!store.getters.getLoginUserInfo){
    store.commit("showLogin",true)
    return
  }
  let res=await proxy.Request({
    url:api.doLike,
    params:{
      articleId:articlInfo.value.articleId
    }
  })
  if(!res){
    return
  }
  haveLike.value = !haveLike.value
  let goodCount=1
  if(!haveLike.value){
    goodCount=-1
  }
  articlInfo.value.goodCount=articlInfo.value.goodCount+goodCount
}
//下载附件
const downLoadAttachment=async(fileId)=>{
 
  if(!currentUserInfo.value){
    store.commit("showLogin",true)
    return
  }
  //0积分
  if(
    attachment.value.integral==0||currentUserInfo.value.userId==articlInfo.value.userId
  ){
    document.location.href=api.attachmentDownload+"?fileId="+fileId
    attachment.value.downloadCount=attachment.value.downloadCount+1
    return
  }
  let res =await proxy.Request({
    url:api.getUserIntegral,
    params:{
      fileId:fileId
    }
  })
  if(!res){
    return 
  }
  //判断用户是否已经下载过
  if(res.data.haveDownload){
    document.location.href=api.attachmentDownload+"?fileId="+fileId
    attachment.value.downloadCount=attachment.value.downloadCount+1
    return
  }
  if(res.data.userIntegral<attachment.value.integral){
    proxy.Message.warning("你的积分不够，无法下载")
    return
  }
  proxy.Confirm(`你还有${res.data.userIntegral}积分，当前下载会扣除${attachment.value.integral}积分,确定要下载吗？`,()=>{
    document.location.href=api.attachmentDownload+"?fileId="+fileId
    attachment.value.downloadCount=attachment.value.downloadCount+1
  })
}
//文章图片预览
const imageViewerRef=ref(null)
const previewImgList=ref([])
const imagePreview=()=>{
  nextTick(()=>{
    const imageNodeList=document.querySelector("#detail").querySelectorAll("img")
    const imageList=[]
    imageNodeList.forEach((item,index)=>{
      const src=item.getAttribute("src")
      imageList.push(src)
      item.addEventListener('click',()=>{
        imageViewerRef.value.show(index)
      })
    })
    previewImgList.value=imageList
  })
}
//代码高亮
const highlightCode=()=>{
  nextTick(()=>{
    let blocks=document.querySelectorAll('pre code')
    blocks.forEach((item)=>{
      hljs.highlightBlock(item)
    })
  })
}

//更新评论
const updateCommentCount=(comCount)=>{
  articlInfo.value.commentCount=comCount
}

//获取目录
const tocArray=ref([])
const makeToc=()=>{
  nextTick(()=>{
    const tocTags=["H1","H2","H3","H4","H5","H6"]
    const contentDom=document.querySelector('#detail')
    const childNodes=contentDom.childNodes
    let index=0
    childNodes.forEach((item)=>{
      let tagName=item.tagName
      if(tagName ==undefined || !tocTags.includes(tagName.toUpperCase())){
        return true
      }
      index++
      let id="toc" + index
      item.setAttribute("id",id)
      tocArray.value.push({
        id:id,
        title:item.innerText,
        level:Number.parseInt(tagName.substring(1)),
        offsetTop:item.offsetTop
      })
    })
  })
}
const anchorId=ref(null)
const gotoAnchor=(domId)=>{
    const dom=document.querySelector("#"+domId)
    dom.scrollIntoView({
      behavior:'smooth',
      block:'start'
    })
}
const listenerScroll =()=>{
  let currentScrollTop=getScrollTop()
  tocArray.value.some((item,index)=>{
    if(
      (index<tocArray.value.length-1&& currentScrollTop>=tocArray.value[index].offsetTop &&currentScrollTop<tocArray.value[index+1].offsetTop) ||
      (index==tocArray.value.length-1 && currentScrollTop<tocArray.value[index].offsetTop)
    ){
      anchorId.value=item.id
      return true
    }
  })
}
//获取滚动条高度
const getScrollTop=()=>{
  let scrollTop=document.documentElement.scrollTop || document.body.scrollTop
  return scrollTop
}
 const showComment=ref(false)
 watch(() => store.state.sysSetting,(newVal, oldVal) => {
  if(newVal){
    showComment.value=newVal.commentOpen
  }
 }, { immediate: true, deep: true });
</script>

<style lang="scss">
.container-body{
  position: relative;
.board-info{
  line-height: 30px;
  .icon-right{
    margin: 0px 10px;
  }
}
.detail-container{
  .article-detail{
    background: #fff;
    padding: 15px;
    .title{
      font-weight: bolder;
    }
    .user-info{
      margin-top: 15px;
      display: flex;
      padding-bottom: 10px;
      border-bottom: 1px solid #ddd;
      .user-info-detail{
        margin-left: 10px;
        .nick-name{
          text-decoration: none;
          color: #4e5969;
          font-size: 15px;
          cursor: pointer;
        }
         .nick-name:hover{
          color:#409eff ;
         }
         .time-info{
          margin-top: 5px;
          font-size: 13px;
          .iconfont{
            margin-left: 10px;
            color: #4e5969;
          }
          .iconfont::before{
            padding-right: 3px;
          }
         }

    }
  }
  .detail{
    letter-spacing: 1px;
    line-height: 22px;
    img{
      max-width: 90%;
    }
  }

}
  .attachment-panel{
    background: #fff;
    margin-top: 20px;
    padding: 20px;
    .title{
      font-size: 18px;
    }
    .attachment-info{
      display: flex;
      align-items: center;
      color: #9f9f9f;
      margin-top: 10px;
      .item{
        margin-right: 10px;
      }
      .icon-zip{
        font-size: 20px;
        color: #6ca1f7;
      }
      .file-name{
        color:#6ca1f7
      }
      .integral{
        color: red;
        padding: 0 5px;
        }
    }
  }
  .comment-panel{
    background: #fff;
    margin-top: 20px;
    margin-bottom: 100px;
  }
}
.quick-panel{
  position: fixed;
  width: 50px;
  height: 50px;
  top: 200px;
  left: 150px;
  text-align: center;
  .el-badge__content.is-fixed{
    top: 5px;
    right: 15px;
  }
  .quick-item{
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #fff;
    margin-bottom: 30px;
    cursor: pointer;
    .iconfont{
      font-size: 22px;
      color: #9f9f9f;
    }
    .have-like{
      color: red;
    }
  }
}
.toc-panel{
  position: absolute;
  top: 45px;
  right: 0px;
  width: 285px;
  .top-containner{
    width: 285px;
    position: fixed;
    background: #fff;
    .toc-title{
      border-bottom: 1px solid #ddd;
      padding: 10px;
    }
    .toc-list{
      max-height: calc(100vh - 200px);
      overflow: auto;
      padding: 5px;
      .no-toc{
        text-align: center;
        color: #5f5d5d;
        line-height: 40px;
        font-size:13px
      }
      .toc-item{
        cursor: pointer;
        display: block;
        line-height: 35px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: #555666;
        border-radius:3px;
        font-size: 14px;
        border-left: 2px solid #fff;
      }
      .toc-item:hover{
        background: #eeeded;
      }
      .active{
        border-left: 2px solid #6ca1f7;
        border-radius: 0px 3px 3px 0px;
      }
    }
  }
}
}
</style>
