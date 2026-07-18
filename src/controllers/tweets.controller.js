import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Tweet } from "../models/tweets.model";
import { asyncHandler } from "../utils/asyncHandler";
import { isValidObjectId } from "mongoose";

const createTweet= asyncHandler(async(req,res)=>{

    const {content}= req.body;
    if(!content || content?.trim()===""){

        throw new ApiError(400,"tweet dooesnot exist")
    }
    const tweet= await Tweet.create({
        content,
        owner:req.user?._id
    });
    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating tweet");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            tweet,
            "Tweet created successfully"
        )
    );

})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "This user id is not valid")
    }

   
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const tweets = await Tweet.find({
        owner:user._id
    }).sort({createdAt:-1});
    // const tweets = await Tweet.aggregate([
    //     {
    //         $match:{
    //             owner: user._id,
    //         }
            
    //     }
    // ]);

    if(!tweets){
        throw new ApiError(500, "something went wrong while fetching tweets")
    
    }
    
     return res.status(201).json(
        new ApiResponse(200, tweets, "tweets fetched  successfully!!"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {newcontent}=req.body;
    const {tweetId}=req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id");
    }
    if (!content?.trim()) {
        throw new ApiError(400, "Tweet content is required");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request");
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                newcontent,
            },
        },
        {
            new: true,
        }
    );
    if(!updateTweet){
    throw new ApiError(500, "something went wrong while updating tweet")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully"
        )
    );

})


const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId}=req.param;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request");
    }

    const deleteTweet = await Tweet.deleteOne(req.user._id)
    if(!deleteTweet){
        throw new ApiError(500, "something went wrong while deleting tweet")
    }
    
      
    return res.status(201).json(
        new ApiResponse(200, deleteTweet, "tweet deleted successfully!!"))

})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets,
}

