import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import graphql, { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList } from 'graphql'
import {graphqlHTTP} from 'express-graphql'
import User from './models/user.js'
const saltRounds = 10
import Room from './models/room.js'
import Building from './models/building.js'

const UserType=new GraphQLObjectType({
    name:"User",
    description:"Represents User",
    fields:()=>({
        id:{type:new GraphQLNonNull(GraphQLString)},
        firstname:{type:new GraphQLNonNull(GraphQLString)},
        secondname:{type:new GraphQLNonNull(GraphQLString)},
        email:{type:new GraphQLNonNull(GraphQLString)},
        password:{type:new GraphQLNonNull(GraphQLString)},
        buildings:{
            type:new GraphQLList(BuildingType),
            resolve:(user)=>Building.find({updatedbyid:user.id})
        },
        rooms:{
            type:new GraphQLList(RoomType),
            resolve:(user)=>Room.find({updatedbyid:user.id})
        }
    })
})



const BuildingType=new GraphQLObjectType(
    {
        name:"Building",
        description:"Represents a building",
        fields:()=>(
            {   id:{type:new GraphQLNonNull(GraphQLString)},
                updatedbyid:{type:new GraphQLNonNull(GraphQLString)},
                name:{type:new GraphQLNonNull(GraphQLString)},
                totalrooms: {type: new GraphQLNonNull(GraphQLInt)},
                roomsavailable:{type: new GraphQLNonNull(GraphQLInt)}
            }
        )
    }
)

const RoomType=new GraphQLObjectType(
    {
        name:"Room",
        description:"Represents Room",
        fields:()=>({
            id:{type:new GraphQLNonNull(GraphQLString)},
            updatedbyid:{type:new GraphQLNonNull(GraphQLString)},
            roomnumber:{type:new GraphQLNonNull(GraphQLInt)},
            buildingname:{type:new GraphQLNonNull(GraphQLString)},
            taken:{type:new GraphQLNonNull(GraphQLBoolean)},
            building:{
                type:BuildingType,
                resolve:(room)=>Building.findOne({name:room.buildingname})
            }
        })
    }
)

const RootQuery=new GraphQLObjectType(
    {
        name:"RootQuery",
        description:"Represents root queries",
        fields:()=>(
            {
                user:{
                    description:"Fetches a single user",
                    type:UserType,
                    args:{
                        ID: {type:new GraphQLNonNull(GraphQLString)}
                    },
                    resolve:(parent, args)=>User.findById({"_id":args.ID}).then((res)=>res).catch(err=>err)
                },
                users:{
                    description:"Fetches a list of users",
                    type:new GraphQLNonNull(new GraphQLList(UserType)),
                    resolve:()=>User.find().then(result=>result).catch(err=>err)
                },
                room:{
                    description:"Fetches a single room",
                    type:RoomType,
                    args:{
                        ID: {type:new GraphQLNonNull(GraphQLString)}
                    },
                    resolve:(parent,args)=>Room.findById({"_id":args.ID}).then(result=>result).catch(err=>err)
                },
                rooms:{
                    description:"Fetches the list of rooms",
                    type:new GraphQLList(RoomType),
                    resolve:()=>Room.find().then(res=>res).catch(err=>err)
                },
                building:{
                    description:"Fetches a single building",
                    type:BuildingType,
                    args:{
                        ID:{type:new GraphQLNonNull(GraphQLString)}
                    },
                    resolve:()=>Building.findById({"_id":args.ID}).then(result=>result).catch(err=>err)
                },
                buildings:{
                    description:"Fetches a list of list of buildings",
                    type:new GraphQLList(BuildingType),
                    resolve:()=>Building.find().then(res=>res).catch(err=>err)
                }
            }
        )
    }
)
 
const signUp=async(pass,rounds)=>{
    const hashedPass = await new Promise((resolve, reject) => {
        bcrypt.hash(pass, rounds, function(err, hash) {
          if (err) reject(err)
            resolve(hash)
        });
    });
    return hashedPass;
}

const RootMutation=new GraphQLObjectType(
    {
        name:"RootMutation",
        description:"Represents root mutations",
        fields:()=>({
            addUser:{
                description:"Add user",
                type:UserType,
                args:{
                    firstname:{type: new GraphQLNonNull(GraphQLString)},
                    secondname:{type: new GraphQLNonNull(GraphQLString)},
                    email:{type: new GraphQLNonNull(GraphQLString)},
                    password:{type: new GraphQLNonNull(GraphQLString)},
                },
                resolve:(parent,args)=>{
                        const user=new User(
                            {
                                firstname:args.firstname,
                                secondname:args.secondname,
                                email:args.email,
                                password:hash
                            }
                        );
                        return user.save().then(addedUser=>addedUser ).catch(err=>err);
                   
                }
            },
            updateUser:{
                description:"Updates user",
                type:UserType,
                args:{
                    ID: {type:new GraphQLNonNull(GraphQLString)},
                    firstname:{type: new GraphQLNonNull(GraphQLString)},
                    secondname:{type: new GraphQLNonNull(GraphQLString)},
                    email:{type: new GraphQLNonNull(GraphQLString)},
                    password:{type: new GraphQLNonNull(GraphQLString)},
                },
                resolve:(parent,args)=>{
                     User.findByIdAndUpdate(
                        {
                            "_id":args.ID
                        },
                        {
                            "firstname":args.firstname,
                            "secondname":args.secondname,
                            "email":args.email,
                            "password":args.password
                        },
                        {
                            returnOriginal:false
                        }
                    )
                    .then((updatedUser)=>updatedUser)
                }
            },
            deleteUser:{
                description:"Deletes user",
                type:UserType,
                args:{
                    ID: {type:new GraphQLNonNull(GraphQLString)},
                },
                resolve:(parent,args)=>User.findByIdAndDelete({"_id":args.ID})
                .then((deletedUser)=>deletedUser)
                .catch(err=>err)
            },
// Building mutations begins
            addBuilding:{
                description:"Adds building",
                type:BuildingType,
                args:{
                    updatedbyid:{type:new GraphQLNonNull(GraphQLString)},
                    name: {type:new GraphQLNonNull(GraphQLString)},
                    totalrooms:{type:new GraphQLNonNull(GraphQLInt)},
                    roomsavailable:{type:new GraphQLNonNull(GraphQLInt)}
                },
                resolve:(parent,args)=>{
                    const building=new Building({
                        updatedbyid:args.updatedbyid,
                        name: args.name,
                        totalrooms:args.totalrooms,
                        roomsavailable:args.roomsavailable
                    })

                    return building.save().then(addedBuilding=>addedBuilding)
                    .catch(err=>err)
                }

            },

            updateBuilding:{
               description:"Updates a given building",
               type:BuildingType,
               args:{
                ID:{type:new GraphQLNonNull(GraphQLString)},
                updatedbyid:{type:new GraphQLNonNull(GraphQLString)},
                name: {type:new GraphQLNonNull(GraphQLString)},
                totalrooms:{type:new GraphQLNonNull(GraphQLInt)},
                roomsavailable:{type:new GraphQLNonNull(GraphQLInt)}
               } ,
               resolve:(parent,args)=>{
                return Building.findByIdAndUpdate(
                    {"_id":args.ID},
                    {
                        updatedbyid:args.updatedbyid,
                        name:args.name,
                        totalrooms:args.totalrooms,
                        roomsavailable:args.roomsavailable
                    },
                    {
                        returnOriginal:false
                    }
                )
                .then(updatedBuilding=>updatedBuilding)
                .catch(err=>err)
               }
            },
            deleteBuilding:{
                description:"Deletes a single room",
                type:BuildingType,
                args:{
                    ID:{type:new GraphQLNonNull(GraphQLString)},
                },
                resolve:(parent,args)=>Building.findByIdAndDelete({"_id":args.ID})
                .then(deletedBuilding=>deletedBuilding)
                .catch(err=>err)
            },
// Room mutations begins
            addRoom:{
                description:"Adds a new room",
                type:RoomType,
                args:{
                    updatedbyid:{type:new GraphQLNonNull(GraphQLString)},
                    roomnumber:{type:new GraphQLNonNull(GraphQLInt)},
                    buildingname:{type:new GraphQLNonNull(GraphQLString)},
                    taken:{type:new GraphQLNonNull(GraphQLBoolean)},
                },
                resolve:(parent,args)=>{
                    const room=new Room({
                        updatedbyid:args.updatedbyid,
                        roomnumber:args.roomnumber,
                        buildingname:args.buildingname,
                        taken:args.taken
                    })
                   return room.save().then(addedRoom=>addedRoom).catch(err=>err)
                }
            },
            updateRoom:{
                description:"Updates an existing room",
                type:RoomType,
                args:{
                    ID:{type:new GraphQLNonNull(GraphQLString)},
                    updatedbyid:{type:new GraphQLNonNull(GraphQLString)},
                    roomnumber:{type:new GraphQLNonNull(GraphQLInt)},
                    buildingname:{type:new GraphQLNonNull(GraphQLString)},
                    taken:{type:new GraphQLNonNull(GraphQLBoolean)},
                },
                resolve:(parent,args)=>{
                    return Room.findByIdAndUpdate(
                        {"_id":args.ID},
                        {
                            updatedbyid:args.updatedbyid,
                            roomnumber:args.roomnumber,
                            buildingname:args.buildingname,
                            taken:args.taken,
                        },
                        {
                            returnOriginal:false
                        }
                    )
                    .then(updatedRoom=>updatedRoom)
                    .catch(err=>err)
                }
            },

            deleteRoom:{
                description:"Deletes a room of the provided id",
                type:RoomType,
                args:{
                    ID:{type:new GraphQLNonNull(GraphQLString)},
                },
                resolve:(parent,args)=>Room.findByIdAndDelete({"_id":args.ID})
                .then(deletedRoom=>deletedRoom)
                .catch(err=>err)
            }
        })
    }
)



const PORT=5000
const app=express();

mongoose.connect("mongodb://localhost:27017").then((res)=>{
    app.listen(PORT,()=>{
        console.log(`Listening on ${PORT}`);   
    })
})

const Schema = new GraphQLSchema({
    query:RootQuery,
    mutation:RootMutation
})

app.use("/graphiql",graphqlHTTP(
        {
            schema:Schema,
            graphiql:true
        }
    )
)

  


