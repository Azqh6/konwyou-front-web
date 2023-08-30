<template>
    <div class="post-comment-panel">
        <Avatar :width="avatarWidth" :height="avatarHeight" :userId="userId" style="margin-left: 3px;"></Avatar>
        <div class="comment-form">
            <el-form :model="formData" :rules="rules" ref="formDataRef">
                <el-form-item prop="content">
                    <el-input clearable :placeholder=placeholderInfo type="textarea" :maxlength="800" resize="none"
                        show-word-limit v-model="formData.content">

                    </el-input>
                    <div class="insert-img" v-if="showInsertImg">
                        <div class="pre-img" v-if="commentImg">
                            <CommentImage :src="commentImg" ></CommentImage>
                            <span class="iconfont icon-remove" @click="removeCommentImg"></span>
                        </div>
                        <el-upload v-else  name="file" :show-file-list="false" accept=".png,.PNG,.jpg,.JPG,.gif,.GIF"
                            :multiple="false" :http-request="selectImg">
                            <span class="iconfont icon-image" ></span>
                        </el-upload>
                    </div>
                </el-form-item>
            </el-form>
        </div>
        <div class="send-btn" @click="postCommentDo">发表</div>
    </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
import CommentImage from "./CommentImage.vue";
const { proxy } = getCurrentInstance();
const props = defineProps({
    articleId: {
        type: String
    },
    pCommentId: {
        type:Number
    },
    replyUserId: {
        type: String
    },
    avatarWidth: {
        type: Number
    },
    avatarHeight: {
        type: Number
    },
    userId: {
        type: String
    },
    showInsertImg: {
        type: Boolean
    },
    placeholderInfo: {
        type: String,
        default: "请文明发言做一个好的程序员"
    }
})
const api = {
    postComment: "/comment/postComment"
}
const checkPostComment=(rule,value,callback)=>{
    if(value==null && formData.value.image==null){
        callback(new Error(rule.message))
    }else{
        callback()
    }
}
//form表单
const formData = ref({})
const formDataRef = ref()
const validate=()=>{
    const content=formData.value.content
    return content.length >=5
}
const rules = {
    content: [{ required: true, message: "请输入评论内容",validator:checkPostComment },{min:5,message:'内容至少为5个字符',trigger:'blur'}]
}
//选择图片
const commentImg=ref(null)
const selectImg = (file) => {
    file=file.file
    let img=new FileReader()
    img.readAsDataURL(file)
    img.onload=({target})=>{
        let imgData=target.result
        commentImg.value=imgData
        formData.value.image=file
    }
 }
//发送评论
const emit = defineEmits(["postCommentFinish"])

const postCommentDo = () => {

    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return
        }
        let params = Object.assign({}, formData.value)
        params.articleId = props.articleId
        params.pCommentId = props.pCommentId
        params.replyUserId = props.replyUserId
        let res = await proxy.Request({
            url: api.postComment,
            params,
        })
        if (!res) {
            return
        }
        proxy.Message.success("评论发表成功")
        formDataRef.value.resetFields()
        emit("postCommentFinish", res.data)
        commentImg.value=null
    })

}

const removeCommentImg=()=>{
    commentImg.value=null
    formData.value.image=null;
}
</script>

<style lang="scss">
.post-comment-panel {
    display: flex;
    align-items: top;

    .comment-form {
        flex: 1;
        margin: 0px 10px;

        .el-textarea__inner {
            height: 60px;
        }

        .insert-img {
            line-height: normal;

            .iconfont {
                font-size: 20px;
                color: #727171;
                margin-top: 3px;
            }
            .pre-img{
                margin-top: 10px;
                position: relative;
                .iconfont{
                    cursor: pointer;
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    color: rgb(121,121,121);
                }
            }
        }
    }

    .send-btn {
        cursor: pointer;
        width: 60px;
        height: 60px;
        background: #409eff;
        color: #fff;
        text-align: center;
        line-height: 60px;
        border-radius: 5px;
        margin-right: 3px;
    }
}
</style>
