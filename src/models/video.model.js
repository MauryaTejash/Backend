import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videofile:{
            type: String,
            require: true,
        },
        thumbnail:{
            type: String,
            require: true,
        },
        title:{
            type: String,
            require: true,
        },
        description:{
            type: String,
            require: true,
        },
        duration:{
            type: Number,
            require: true,
        },
        views:{
            type: Number,
            default: 0,
        },
        isPubliced:{
            type: Boolean,
            default: true,
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate) //add there own plugins and to run queries
export const Video = mongoose.model("Video",videoSchema)