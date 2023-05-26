import mongoose, { mongo } from 'mongoose'
import colors from 'colors'

const connectDB = async () =>{
    try {
        const conn = mongoose.connect(process.env.MONGODB_ATLAS_COMPASS_URL)
        console.log(`Connected to MongoDb`.bgYellow.black)
    } catch (error) {
        console.log(`Error in mongoDB ${error}`.bgRed.white)
    }
}

export default connectDB;