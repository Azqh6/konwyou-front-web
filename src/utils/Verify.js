const regs={
    email:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/,
    number:/^[a-zA-Z0-9_]{6,16}$/,
    password:/^[a-zA-Z0-9._\/]{8,16}$/
}
const verify=( rule,value,reg,callback)=>{
    if(value){
        if(reg.test(value)){
            callback()
        }else{
            callback(new Error(rule.message))
        }
    }else{
        callback()
    }
}

export default{
    email:(rule,value,callback)=>{
        return verify(rule,value,regs.email,callback)
    },
    number:(rule,value,callback)=>{
        return verify(rule,value,regs.number,callback)
    },
    password:(rule,value,callback)=>{
        return verify(rule,value,regs.password,callback)
    },
}