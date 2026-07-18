import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.use(verifyJWT);
router.post(
    "/c/:channelId",
    toggleSubscription
);
router.get(
    "/c/:channelId/subscribers",
    getUserChannelSubscribers
);

router.get(
    "/u/:subscriberId/subscriptions",
    getSubscribedChannels
);


export default router;