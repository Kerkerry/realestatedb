import mongoose from "mongoose";
const Schema=mongoose.Schema;

const UserSchema=new Schema(
    {
        firstname:{
            type:String,
            required:true
        },
        secondname:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
    },
    {
        timestamps:true
    }
)

const User=mongoose.model("user",UserSchema);
export default User;