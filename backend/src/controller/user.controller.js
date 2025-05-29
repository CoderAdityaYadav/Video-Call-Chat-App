import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

// === Get a list of recommended users to add as friends ===
export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;
        // Find users who are not the current user, not already friends, and are onboarded
        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // exclude current user
                { _id: { $nin: currentUser.friends } }, // exclude already friends
                { isOnboarded: true },
            ],
        });
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error(
            "Error in get recomended users controller",
            error.message
        );
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// === Get the current user's friends list ===
export async function getMyFriends(req, res) {
    try {
        // Find user by ID and populate friends' details
        const user = await User.findById(req.user.id)
            .select("friends")
            .populate(
                "friends",
                "fullName profilePic nativeLanguage learningLanguage"
            );
        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// === Send a friend request to another user ===
export async function sendFriendRequest(req, res) {
    try {
        // Get sender and recipient IDs
        const myId = req.user.id;
        const recipientId = req.params.id;

        // Prevent sending request to yourself
        if (myId === recipientId) {
            return res.status(400).json({
                message: "You can't send friend request to yourself.",
            });
        }

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient)
            return res.status(404).json({ message: "Recipient not found" });

        // Check if already friends
        if (recipient.friends.includes(myId)) {
            return res
                .status(400)
                .json({ message: "You are already friends with the user" });
        }

        // Check if a friend request already exists (either direction)
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId },
            ],
        });
        if (existingRequest) {
            return res.status(400).json({
                message:
                    "A friend request already exists between you and this user",
            });
        }

        // Create the friend request
        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        // Respond with the created friend request
        res.status(201).json(friendRequest);
    } catch (error) {
        console.log("Error in sendFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// === Accept a pending friend request ===
export async function acceptFriendRequest(req, res) {
    try {
        // Get the friend request ID from params
        const requestId = req.params.id;

        // Find the friend request by ID
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest)
            return res
                .status(404)
                .json({ message: "Friend request not found." });

        // Check if the current user is the recipient
        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to accept this request",
            });
        }

        // Update the friend request status to accepted
        friendRequest.status = "accepted";
        await friendRequest.save();

        // Add each user to the other's friends array
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient },
        });
        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender },
        });

        // Respond with success message
        res.status(200).json({ message: "Friend Request accepted" });
    } catch (error) {
        console.log("Error in acceptFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// === Get all incoming and accepted friend requests for the current user ===
export async function getFriendRequests(req, res) {
    try {
        // Find all incoming pending friend requests
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate(
            "sender",
            "fullName profilePic nativeLanguage learningLanguage"
        );

        // Find all accepted friend requests sent by the user
        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        }).populate("recipient", "fullName profilePic");

        // Respond with both lists (add this line)
        res.status(200).json({
            incoming: incomingReqs,
            accepted: acceptedReqs,
        });
    } catch (error) {
        console.log(
            "Error in getPendingFriendRequests controller",
            error.message
        );
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// === Get all outgoing (sent) friend requests by the current user ===
export async function getOutgoingFriendReqs(req, res) {
    try {
        // Find all pending friend requests sent by the user
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate(
            "recipient",
            "fullName profilePic nativeLanguage learningLanguage"
        );
        // Respond with the outgoing requests
        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.log("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}