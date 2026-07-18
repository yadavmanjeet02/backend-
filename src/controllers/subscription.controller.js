import { User } from "../models/user.model";
import mongoose,{isValidObjectId} from "mongoose";
import {Subscription} from "../models/subscription.model"
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";


const toggleSubscription= asyncHandler(async(req,res)=>{

    const {channelId}= req.param

     if(!isValidObjectId(channelId)){
        throw new ApiError(
            400,
            "This channel id is not valid"
        )
    }

    const channel=await User.findById({
        _id:channelId
    });

    if(!channel){
        throw new ApiError(
            400,
            "This channel does not Exists"
        )
    }

    let unsubscribe
    let subscribe;

    const itHasSubscription= await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if(itHasSubscription){
        //unsubscribe

        unsubscribe=await Subscription.findOneAndDelete({
            subscriber:req.user._id,
            channel:channelId
        })
        if(!unsubscribe){
            throw new ApiError(500, "something went wrong while unsubscribe the channel")
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                unsubscribe,
                "channel unsubscribe successfully!!"
            )
        )
    }else{
        //subscribe
        subscribe=await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        if(!subscribe){
            throw new ApiError(500, "something went wrong while subscribe the channel")
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                subscribe,
                "channel subscribe successfully!!"
            )
        )
    }


})

//subscriber list of a channel

const getUserChannelSubscribers=asyncHandler(async(req,res)=>{

    const {channelId}=req.param;

    if(!isValidObjectId(channelId)){
        throw new ApiError(
            400,
            "This channel id is not valid"
        )
    }

    const subscriptions= await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }

        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberDetails",
            
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullname:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscriber:{
                    $first:"$subscriberDetails"
                }
            }
        },
        {
            $project:{
                subscriber:1
            }
        }
    ]);
        


})


//subscribed channel

const getSubscribedChannels = asyncHandler(async (req, res) => {

    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(
            400,
            "Invalid subscriber id"
        );
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",

                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                            coverimage: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                channel: {
                    $first: "$channelDetails"
                }
            }
        },
        {
            $project: {
                channel: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            subscriptions,
            "Subscribed channels fetched successfully"
        )
    );

});
