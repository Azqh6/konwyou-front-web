<template>
    <div>
        <div class="header" v-show="showHeader">
            <div class="header-content" :style="{ width: proxy.globalInfo.bodyWidth + 'px' }">
                <!-- logo -->
                <router-link to="/" class="logo ">
                    <span v-for="item in logos" :style="{ color: item.color }">{{ item.text }}</span>
                </router-link>
                <!-- 板块信息 -->
                <div class="menu-panel">
                    <router-link to="/" :class="['menu-item home',activePboardId==undefined?'active':'']">首页</router-link>
                    <template v-for="board in boardList" :key="board.boardId">
                        <el-popover placement="bottom-start" :width="300" trigger="hover" v-if="board.children.length>0">
                            <template #reference>
                                <span :class="['menu-item',board.boardId==activePboardId?'active':'']" @click="boardClickHandler(board)">{{ board.boardName }}</span>
                            </template>
                            <div class="sub-board-list">
                                <span :class="['sub-board',boardItem.boardId==activeBoardId?'active':'']" v-for="boardItem in board.children" :key="boardItem.boardId" @click="subBoardClickHandler(boardItem)">{{boardItem.boardName}}</span>
                            </div>
                        </el-popover>
                        <span v-else :class="['menu-item',board.boardId==activePboardId?'active':'']" @click="boardClickHandler(board)" >{{ board.boardName}}</span>
                    </template>
                </div>
                <!-- 用户信息 -->
                <div class="user-info-panel">
                    <div class="op-btn">
                        <el-button type="primary" @click="newPost">
                            发帖<span class="iconfont icon-add"></span>
                        </el-button>
                        <el-button type="primary" @click="goSearch">
                            搜索<span class="iconfont icon-search"></span>
                        </el-button>
                    </div>
                    <template v-if="userInfo.userId">
                        <div class="message-info">
                            <el-dropdown>
                                <el-badge :value="messageCountInfo.total" class="item" :hidden="messageCountInfo.total==null || messageCountInfo.total==0">
                                    <div class="iconfont icon-message"></div>
                                </el-badge>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="gotoMessage('reply')" class="message-item">
                                            <span class="text">回复我的</span>
                                            <span class="count-tag" v-if="messageCountInfo.reply>0">{{messageCountInfo.reply>99?'99+':messageCountInfo.reply}}</span>
                                        </el-dropdown-item>
                                        <el-dropdown-item @click="gotoMessage('likePost')" class="message-item">
                                            <span class="text">赞了我的文章</span>
                                            <span class="count-tag" v-if="messageCountInfo.likePost>0">{{messageCountInfo.likePost>99?'99+':messageCountInfo.likePost}}</span>
                                        </el-dropdown-item>
                                        <el-dropdown-item @click="gotoMessage('downloadAttachment')" class="message-item">
                                            <span class="text">下载了我的附件</span>
                                            <span class="count-tag" v-if="messageCountInfo.downloadAttachment>0">{{messageCountInfo.downloadAttachment>99?'99+':messageCountInfo.downloadAttachment}}</span>
                                        </el-dropdown-item>
                                        <el-dropdown-item @click="gotoMessage('likeComment')" class="message-item">
                                            <span class="text">赞了我的评论</span>
                                            <span class="count-tag" v-if="messageCountInfo.likeComment>0">{{messageCountInfo.likeComment>99?'99+':messageCountInfo.likeComment}}</span>
                                        </el-dropdown-item>
                                        <el-dropdown-item @click="gotoMessage('sys')" class="message-item">
                                            <span class="text"> 系统消息</span>
                                            <span class="count-tag" v-if="messageCountInfo.sys>0">{{messageCountInfo.sys>99?'99+':messageCountInfo.sys}}</span>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                        <div class="user-info">
                            <el-dropdown>
                                <Avatar :userId="userInfo.userId" :width="50" :height="50"></Avatar>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="gotoUcenter(userInfo.userId)">我的主页</el-dropdown-item>
                                        <el-dropdown-item @click="logout">退出</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </template>
                    <el-button-group v-else style="margin-left: 10px;">
                        <el-button type="primary" @click="loginAndRegister(1)" plain>登录</el-button>
                        <el-button type="primary" @click="loginAndRegister(0)" plain>注册</el-button>
                    </el-button-group>

                </div>
            </div>
        </div>
        <div class="body-content">
            <router-view />
        </div>
        <div class="footer" v-if="showFooter">
            <div class="footer-content"  :style="{ width: proxy.globalInfo.bodyWidth + 'px' }">
                <el-row>
                    <el-col :span="6" class="item">
                        <div class="logo">
                            <div class="logo-letter">
                                <span v-for="item in logos" :style="{ color: item.color }">{{ item.text }}</span>
                            </div>
                            <div class="info">
                                一个懂你的社区
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="6" class="item">
                        <div class="title">网站相关</div>
                        <div><img src="@/assets/erweima.png" style="width: 80px; height: 80px;"></div>
                    </el-col>
                    <el-col :span="6" class="item"></el-col>
                    <el-col :span="6" class="item"></el-col>
                </el-row>
            </div>
        </div>
        <!-- 登录 注册 -->
        <LoginAndRegister ref="loginRegisterRef"></LoginAndRegister>
        <!-- 回到顶部 -->
        <el-backtop :right="100" :bottom="100"></el-backtop>
        
    </div>
</template>

<script setup>
//@ts-ignore
import LoginAndRegister from './LoginAndRegister.vue';
import { ref, reactive, getCurrentInstance, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex';
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const store = useStore()
const api = {
    getUserInfo: '/getUserInfo',
    loadBoard: '/board/loadBoard',
    getMessageCount:"/ucenter/getMessageCount",
    logout:"/logout",
    getSysSetting:'/getSysSetting'
}
onMounted(() => {
    initScroll()
    getUserInfo()
    loadBoard()
    loadSysSetting()
})
//监听 登录用户信息
const userInfo = ref({})
watch(() => store.state.loginUserInfo, (newVal, oldVal) => {
    if (newVal != undefined && newVal != null) {
        userInfo.value = newVal
    } else {
        userInfo.value = {}
    }
},
    { immediate: true, deep: true })
//监听 是否展示登录框
watch(() => store.state.showLogin, (newVal, oldVal) => {
    if (newVal) {
        loginAndRegister(1)
    }
}, { immediate: true, deep: true });


//logo
const logos = ref([
    {
        text: 'K',
        color: '#3285FF'
    },
    {
        text: 'n',
        color: '#FB3624'
    },
    {
        text: 'o',
        color: '#FFBA02'
    },
    {
        text: 'w',
        color: '#3285FF'
    },
    {
        text: 'y',
        color: '#25B24E'
    }, {
        text: 'o',
        color: '#FD3224'
    },
    {
        text: 'u',
        color: '#FFBA02'
    }
])

//头部导航滚动
const showHeader = ref(true)
const getScrollTop = () => {
    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    return scrollTop
}
const initScroll = () => {
    let initScrollTop = getScrollTop()
    let scrollType = 0
    window.addEventListener("scroll", () => {
        let currentScrollTop = getScrollTop()
        if (currentScrollTop > initScrollTop) {
            scrollType = 1
        } else {
            scrollType = 0
        }
        initScrollTop = currentScrollTop
        if (scrollType == 1 && currentScrollTop > 100) {
            showHeader.value = false
        } else {
            showHeader.value = true
        }
    })
}

//登录
const loginRegisterRef = ref()
const loginAndRegister = (type) => {
    loginRegisterRef.value.showPanel(type)
}

//获取用户信息
const getUserInfo = async () => {
    let res = await proxy.Request({
        url: api.getUserInfo
    })
    if (!res) {
        return
    }
    store.commit("updateLoginUserInfo", res.data)
}

//获取板块信息
const boardList = ref([])
const loadBoard = async () => {
    let res = await proxy.Request({
        url: api.loadBoard
    })
    if (!res) {
        return
    }
    boardList.value = res.data
    store.commit("saveBoardList",res.data)
}
//一级板块  点击跳转
const boardClickHandler=(board)=>{
    router.push(`/forum/${board.boardId}`)
}
//二级板块  点击跳转
const subBoardClickHandler=(boardItem)=>{
    router.push(`/forum/${boardItem.pBoardId}/${boardItem.boardId}`)
}
//监听当前选中的板块
const activePboardId=ref(0)
watch(() =>store.state.activePboardId, (newVal, oldVal) => {
    
        activePboardId.value=newVal
    
}, { immediate: true, deep: true });
const activeBoardId=ref(0)
watch(() =>store.state.activeBoardId, (newVal, oldVal) => {
        activeBoardId.value=newVal
}, { immediate: true, deep: true });

//发帖
const newPost=()=>{
    if(!store.getters.getLoginUserInfo){
        loginAndRegister(1)
    }else{
        router.push("/newPost")
    }
}

const gotoUcenter=(userId)=>{
    router.push(`/user/${userId}`)
}
//消息相关
const gotoMessage=(type)=>{
    router.push(`/user/message/${type}`)
}
const messageCountInfo=ref({})
const getMessageCount=async()=>{
    let res=await proxy.Request({
        url:api.getMessageCount
    })
    if(!res){
        return
    }
    messageCountInfo.value=res.data
    store.commit("updateMessageCountInfo",res.data)
}
watch(() =>store.state.messageCountInfo, (newVal, oldVal) => {
    messageCountInfo.value=newVal || {}
}, { immediate: true, deep: true });


watch(() =>store.state.loginUserInfo, (newVal, oldVal) => {
    if(newVal){
        getMessageCount()
    }
}, { immediate: true, deep: true });
//退出
const logout=async ()=>{
        let res=await proxy.Request({
            url:api.logout
        })
        if(!res){
            return
        }
        store.commit("updateLoginUserInfo",null)
        location.reload();
}

//获取系统配置
const loadSysSetting=async ()=>{
    let res=await proxy.Request({
        url:api.getSysSetting
    })
    if(!res){
        return
    }
    store.commit("saveSysSetting",res.data)
}
const goSearch=()=>{
    router.push('/search')
}

const showFooter=ref(true)
watch(() => route.path,(newVal, oldVal) => {
    if(newVal.indexOf("newPost") != -1 && newVal.indexOf("editPost") != -1){
        showFooter.value=false
    }else{
        showFooter.value=true
    }
}, { immediate: true, deep: true });
</script>

<style lang="scss">
.header {
    top: 0px;
    width: 100%;
    height: 60px;
    box-shadow: 0 2px 6px 0 #ddd;
    position: fixed;
    background-color: #fff;
    z-index: 1000;

    .header-content {
        height: 60px;
        margin: 0 auto;
        align-items: center;
        display: flex;

        .logo {
            text-decoration: none;
            display: block;
            margin-right: 5px;

            span {
                font-size: 35px;
            }
        }

        .menu-panel {
            flex: 1;
            .menu-item{
                margin-left: 20px;
                cursor: pointer;
                
            }
            .home{
                text-decoration: none;
                color: #000;
            }
            .active{
                color:#409eff ;
            }
        }

        .user-info-panel {
            display: flex;
            width: 310px;
            align-items: center;

            .op-btn {
                .iconfont {
                    margin-left: 5px;
                }

                .el-button+.el-button {
                    margin-left: 5px;
                }
            }

            .message-info {
                margin-left: 5px;
                margin-right: 25px;

                .icon-message {
                    font-size: 25px;
                    color: rgb(147, 147, 147);
                }
            }
        }
    }
   
}
.sub-board-list{
        display: flex;
        flex-wrap: wrap;
        .sub-board{
            padding: 0px 10px;
            border-radius: 20px;
            margin-right: 10px;
            background:rgb(239,239,239);
            border: 1px solid #ddd;
            color:rgb(119, 118, 118);
            margin-top: 10px;
            cursor: pointer;
        }
        .sub-board:hover{
            color:#409eff;
        }
        .active{
            color:#409eff
        }
    }
.body-content{
    position: relative;
    margin-top: 60px;
    min-height: calc(100vh - 210px);
    
}
.message-item{
    display: flex;
    justify-content: space-around;
    .text{
        flex: 1;
    }
    .count-tag{
        height: 15px;
        line-height: 15px;
        min-width: 20px;
        display: inline-block;
        background: #f56c6c;
        border-radius: 10px;
        font-size: 13px;
        text-align: center;
        color: #fff;
        margin-left: 10px;
    }
}

.footer{
    background: #e9e9e9;
    height: 140px;
    margin-top: 10px;

    .footer-content{
        margin: 0px auto;
        padding-top: 10px;
        .item{
            text-align: left;
            .title{
                font-size: 18px;
                margin-bottom: 10px;
            }
            a{
                font-size: 14px;
                text-decoration: none;
                color:var(--linkColor);
                line-height: 25px;
            }
        }
        .logo{
            .logo-letter{
                font-size: 30px;
            }
            .info{
                margin-top: 10px;
                color: rgb(93, 92, 91);

            }
        }
    }
}
</style>
