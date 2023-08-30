<template>
    <div>
        <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="400px"
            :showCancel="false" @close="closeDialog">
            <!-- 表单 -->
            <el-form :model="formData" :rules="rules" ref="formDataRef" class="login-register">
                <el-form-item prop="email">
                    <el-input size="large" v-model="formData.email" placeholder="请输入邮箱" clearable>
                        <template #prefix>
                            <span class="iconfont icon-account"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <!-- 登录密码 -->
                <el-form-item prop="password" v-if="opType==1">
                    <el-input size="large" v-model="formData.password" placeholder="请输入密码"  type="password"  show-password>
                        <template #prefix>
                            <span class="iconfont icon-password"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <!-- 注册 -->
                <div v-if="opType==0 || opType==2">
                    <el-form-item prop="emailCode">
                    <div class="send-email-panel">
                        <el-input size="large" v-model="formData.emailCode" placeholder="请输入邮箱验证码" clearable>
                        <template #prefix>
                            <span class="iconfont icon-checkcode"></span>
                        </template>
                    </el-input>
                   <el-button type="primary" size="large" @click="getEmailCode" style="margin-left: 5px;">获取验证码</el-button>
                </div>
                <el-popover
                placement="left"
                width="500"
                trigger="click">
                <div>
                    <p>1、在垃圾箱中查找邮箱验证码</p>
                    <p>2、在邮箱中->设置->反馈->反垃圾->白名单->设置邮件地址白名单</p>
                    <p>3、将邮箱【1846508601@qq.com】添加到白名单</p>
                </div>
                 <template #reference>
                    <span class="a-link" style="font-size: 14px;">未收到邮箱验证码？</span>
                 </template>
                </el-popover>
                
                </el-form-item>
                <el-form-item prop="nickName" v-if="opType==0">
                    <el-input size="large" v-model="formData.nickName" placeholder="请输入昵称" clearable>
                        <template #prefix>
                            <span class="iconfont icon-account"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="registerPassword">
                    <el-input size="large" v-model="formData.registerPassword" placeholder="请输入密码"  type="password" show-password>
                        <template #prefix>
                            <span class="iconfont icon-password"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="reRegisterPassword">
                    <el-input size="large" v-model="formData.reRegisterPassword" placeholder="请再次输入密码"  type="password" show-password>
                        <template #prefix>
                            <span class="iconfont icon-password"></span>
                        </template>
                    </el-input>
                </el-form-item>
                </div>
                
                <el-form-item prop="checkCode">
                    <div class="check-code-panel">
                        <el-input size="large" v-model="formData.checkCode" placeholder="请输入验证码" clearable @keyup.enter="doSubmit">
                        <template #prefix>
                            <span class="iconfont icon-checkcode"></span>
                        </template>
                    </el-input>
                    <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode(0)" >
                    </div>
                </el-form-item>
                <el-form-item v-if="opType==1">
                    <div class="rememberme-panel">
                        <el-checkbox v-model="formData.rememberMe">记住我</el-checkbox>
                    </div>
                    <div class="no-account" >
                        <a href="javascript:void(0)" class="a-link" @click="showPanel(2)">忘记密码？</a>
                        <a href="javascript:void(0)" class="a-link"  @click="showPanel(0)">没有账号？</a>
                    </div>
                </el-form-item>
                <el-form-item v-if="opType==0">
                    <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">已有账号？</a>
                </el-form-item>
                <el-form-item v-if="opType==2">
                    <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">去登录？</a>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="op-btn" @click="doSubmit">
                        <span v-if="opType==1">登录</span>
                        <span v-if="opType==0">注册</span>
                        <span v-if="opType==2">重置密码</span>
                    </el-button>
                </el-form-item>
            </el-form>
        </Dialog>
        <Dialog :show="dialogConfig4sendMailCode.show" :title="dialogConfig4sendMailCode.title" :buttons="dialogConfig4sendMailCode.buttons" width="500px"
            :showCancel="false" @close="dialogConfig4sendMailCode.show = false">
            <el-form
            :model="formData4sendMailCode"
            :rules="rules"
            ref="formData4sendMailCodeRef"
            label-width="80px"
            >
            <el-form-item label="邮箱">
                {{formData.email}}
            </el-form-item>
            <el-form-item label="验证码" prop="checkCode">
                <div class="check-code-panel">
                        <el-input size="large" v-model="formData4sendMailCode.checkCode" placeholder="请输入验证码" clearable>
                        <template #prefix>
                            <span class="iconfont icon-checkcode"></span>
                        </template>
                    </el-input>
                    <img :src="checkCodeUrl4MailCode" class="check-code" @click="changeCheckCode(1)" >
                    </div>
            </el-form-item>
            </el-form>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, reactive ,getCurrentInstance,nextTick} from 'vue'
import { useRouter, useRoute } from 'vue-router';
import md5 from 'js-md5'
import { useStore } from 'vuex';
const {proxy}=getCurrentInstance()
const router = useRouter()
const route = useRoute()
const store=useStore()
const api={
    checkCode:'/api/checkCode',
    sendMailCode:'/sendEmailCode',
    register:'/register',
    login:'/login',
    resetPwd:'/resetPwd'
}
// 0注册 1登录 2重置密码  弹窗显示方法
const opType = ref()
const showPanel = (type) => {
    opType.value = type
    resetForm()
}
defineExpose({ showPanel })

//表单
const formData = ref({});
const formDataRef = ref();
const dialogConfig = reactive({
    show: false,
    title: "标题",
});

//验证码图片
const checkCodeUrl=ref(api.checkCode)
const checkCodeUrl4MailCode=ref(api.checkCode)
const changeCheckCode=(type)=>{
    if(type==0){
        checkCodeUrl.value=api.checkCode+'?type='+type+'&time='+new Date().getTime()
    }else{
        checkCodeUrl4MailCode.value=api.checkCode+'?type='+type+'&time='+new Date().getTime()
    }
   
}
//发送邮箱验证码 弹窗
const formData4sendMailCode = ref({});
const formData4sendMailCodeRef = ref();
const dialogConfig4sendMailCode = reactive({
    show: false,
    title: "发送邮箱验证码",
    buttons:[
        {
            type:'primary',
            text:'发送验证码',
            click:()=>{
                sendEmailCode()
            }
        }
    ]
});
//获取邮箱验证码 方法
const getEmailCode=()=>{
    formDataRef.value.validateField("email",(valid)=>{
        if(!valid){
            return;
        }
        dialogConfig4sendMailCode.show=true
        nextTick(()=>{
            changeCheckCode(1)
            formData4sendMailCodeRef.value.resetFields()
            formData4sendMailCode.value={
                email:formData.value.email
            }
        })
    })
   
}
//发送邮件 方法
const sendEmailCode=()=>{
    formData4sendMailCodeRef.value.validate(async(valid)=>{
        if(!valid){
            return;
        }
       const params=Object.assign({},formData4sendMailCode.value)
       params.type=opType.value==0?0:1
       let res=await proxy.Request({
        url:api.sendMailCode,
        params:params,
        errorCallback:()=>{
            changeCheckCode(1)
        }
       })
       if(!res){
        return
       }
       proxy.Message.success("验证码发送成功，请登录邮箱查看")
       dialogConfig4sendMailCode.value=false
    })
    
}


//校验规则
const checkRePassword=(rule,value,callback)=>{
    if(value!==formData.value.registerPassword){
        callback(new Error(rule.message))
    }else{
        callback()
    }
}
const rules = {
  email:[
    {required:true,message:'请输入邮箱'},
    {max:150,message:'邮箱太长'},
    {validator:proxy.Verify.email,message:'请输入正确的邮箱'}
  ],
  password:[
    {required:true,message:'请输入密码'}
  ],
  emailCode:[
    {required:true,message:'请输入邮箱验证码'}
  ],
  nickName:[
    {required:true,message:'请输入昵称'}
  ],
  registerPassword:[
    {required:true,message:'请输入密码'},
    {validator:proxy.Verify.password,message:'密码至少包含一个字母和一个数字，并且可以包含特殊符号。密码长度限制在8-16个字符之间。'}
  ],
  reRegisterPassword:[
    {required:true,message:'请再次输入密码'},
    {validator:checkRePassword,message:'两次输入的密码不一致'}
  ],
  checkCode:[
    {required:true,message:"请输入图片验证码"}
  ]
};
//重置表单
const resetForm=()=>{
    dialogConfig.show=true
    if(opType.value==0){
        dialogConfig.title='注册'
    }else if(opType.value==1){
        dialogConfig.title='登录'
    }else if(opType.value==2){
        dialogConfig.title='重置密码'
    }
     nextTick(() => {
        changeCheckCode(0)
        formDataRef.value.resetFields()
        formData.value={}

        //登录
        if(opType.value==1){
            const cookieLoginInfo=proxy.VueCookies.get('loginInfo')
            if(cookieLoginInfo){
                formData.value=cookieLoginInfo
            }
        }
     })
}

//注册 登录 重置密码 提交表单按钮
const doSubmit=()=>{
    formDataRef.value.validate(async (valid)=>{
        if(!valid){
            return
        }
        let params=Object.assign({},formData.value)
        //注册
        if(opType.value==0 || opType.value==2){
            params.password=params.reRegisterPassword
        }
        //登录
        if(opType.value==1){
            let cookieLoginInfo=proxy.VueCookies.get('loginInfo')
            let cookiePassword=cookieLoginInfo== null?null:cookieLoginInfo.password
            if(params.password!==cookiePassword){
                params.password=md5(params.password)
            }
        }
        let url=null
        if(opType.value==0){
            url=api.register
        }else if(opType.value==1){
            url=api.login
        }else if(opType.value==2){
            url=api.resetPwd
        }
        let res= await proxy.Request({
            url:url,
            params:params,
            errorCallback:()=>{
                changeCheckCode(0)
            }
        })
        if(!res){
            return
        }
        //注册返回
        if(opType.value==0){
            proxy.Message.success("注册成功，请登录")
            showPanel(1)
        }else if(opType.value==1){
            //登录
            if(params.rememberMe){
                const loginInfo={
                    email:params.email,
                    password:params.password,
                    rememberMe:params.rememberMe
                }
                proxy.VueCookies.set('loginInfo',loginInfo,'7d')
            }else{
                proxy.VueCookies.remove('loginInfo')
            }
            dialogConfig.show=false
            proxy.Message.success("登录成功")
            store.commit("updateLoginUserInfo",res.data)
        }else if(opType.value==2){
            //重置密码
            proxy.Message.success("重置成功，请登录")
            showPanel(1)
        }
    })
}
const closeDialog=()=>{
    dialogConfig.show=false
    store.commit("showLogin",false)
}
</script>

<style lang="scss" >
.login-register{
    .send-email-panel{
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    .rememberme-panel{
        width: 100%;
    }
    .no-account{
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    .op-btn{
        width: 100%;
    }
}
.check-code-panel{
        display: flex;
        .check-code{
            margin-left: 5px ;
        }
    }
</style>
