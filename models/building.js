import mongoose from "mongoose";
const Schema=mongoose.Schema;

const BuildingSchema=new Schema(
    {
        name:{
            type:String,
            required:true
        },
        totalrooms:{
            type:Number,
            required:true
        },
        roomsavailable:{
            type:Number,
            required:true
        }
    },
    {
        timestamps:true
    }
)

const Building=mongoose.model("building", BuildingSchema)
export default Building;
