import mongoose from "mongoose";

const Schema=mongoose.Schema;

const RoomSchema=new Schema(
    {
        updatedbyid:{
            type:String,
            required:true
        },
        roomnumber:{
            type:Number,
            required:true
        },
        buildingname:{
            type:String,
            required:true
        },
        taken:{
            type:Boolean,
            required:true
        },
    },
    {
        timestamps:true
    }
)

const Room=mongoose.model("room",RoomSchema);
export default Room;