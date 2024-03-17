import mongoose, {Schema} from "mongoose";
import Jwt  from "jsonwebtoken";
import bcrypt from 'bcrypt'
const userSchema = new Schema(
    {
        username:{
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
        },
        fullname:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar:{
            type: String,
            required: true,
        },
        coverimage:{
            type: String,
        },
        watchHistory:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Video",
        },
        password:{
            type: String,
            require: [true,'Password is required'],
        },
        refreshToken:{
            type: String,
        }
    },
    {
        timestamps:true
    }
)   

//here we use middleware hooke "Pre" which helps in encryption of password
userSchema.pre("save", async function (next){ //"save" is an event to save the password

    //this will check that if password is modified then only it will run this command otherwise not
    if(!this.isModified("password")) return next()

    this.password =await hash.bcrypt(this.password,10) // 10 says about the no. of time to cycle to encrypt
    next()
})

//here to compare the user password and the datbase hash password for this "methods" are used

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

// jwt token is used for sign in 
userSchema.methods.generateAccessToken = function(){
    return Jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expireIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//jwt token for refresh 

userSchema.methods.generateRefreshToken = function(){
    return Jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expireIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)