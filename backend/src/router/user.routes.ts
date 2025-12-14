import mongoose, { Schema, Document } from "mongoose";


interface IUSer extends Document {
    username : string , 
    email : string ,
    password : string


}


const UserSchema = new Schema<IUSer>({
    username :{
            type : String ,
            required : true ,
            unique : true
    }, 
        email :{
            type : String ,
            required : true ,
            unique : true

        }, 
        password : {
            type : String ,
            required : true

        }
}, 
     {
    timestamps: true,
  
}
)
export const User = mongoose.model<IUSer>("User" , UserSchema)
export default IUSer;

    