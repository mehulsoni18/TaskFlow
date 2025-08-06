import mongoose from "mongoose";

export const connectDB = async() =>{
    await mongoose.connect('mongodb+srv://1000mehulsoni:mehulsoni@cluster0.lykekif.mongodb.net/TaskFlow').then (() => console.log('db connected'));
}