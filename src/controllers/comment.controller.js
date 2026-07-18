import { User } from "../models/user.model";
import { Comment } from "../models/comment.model";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { isValidObjectId } from "mongoose";


// get video comments
const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video id"
        );
    }
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        );
    }
    const aggregateComments = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",

                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    const comments = await Comment.aggregatePaginate(
        aggregateComments,
        {
            page,
            limit
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "Comments fetched successfully"
            )
        );

});

const addCommentToVideo = asyncHandler(async (req, res) => {

    const { comment } = req.body;
    const { videoId } = req.params;

    if (!comment?.trim()) {
        throw new ApiError(
            400,
            "Comment is required"
        );
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video id"
        );
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        );
    }

    const videoComment = await Comment.create({
        content: comment,
        video: videoId,
        owner: req.user._id
    });

    if (!videoComment) {
        throw new ApiError(
            500,
            "Something went wrong while creating the comment."
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            videoComment,
            "Comment added successfully."
        )
    );

});

const updateCommentToVideo = asyncHandler(async (req, res) => {

    const { newContent } = req.body;
    const { commentId } = req.params;

    if (!newContent?.trim()) {
        throw new ApiError(
            400,
            "Comment content is required"
        );
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(
            400,
            "Invalid comment id"
        );
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(
            404,
            "Comment not found"
        );
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        );
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: newContent
            }
        },
        {
            new: true
        }
    );

    if (!updatedComment) {
        throw new ApiError(
            500,
            "Something went wrong while updating the comment"
        );
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    );

});

const deleteCommentToVideo = asyncHandler(async (req, res) => {

    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(
            400,
            "Invalid comment id"
        );
    }
    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    });

    if (!deletedComment) {
        throw new ApiError(
            404,
            "Comment not found or unauthorized request"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedComment,
            "Comment deleted successfully"
        )
    );

});


export {
    getVideoComments,
    addCommentToVideo,
    updateCommentToVideo,
    deleteCommentToVideo
}