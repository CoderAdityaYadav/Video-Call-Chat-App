import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api.js";
import {
    Channel,
    ChannelHeader,
    Chat,
    MessageInput,
    MessageList,
    Thread,
    Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader.jsx";
import CallButton from "../components/CallButton.jsx";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function ChatPage() {
    const { id: targetUserId } = useParams();
    const [chatClient, setChatClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);

    const { authUser } = useAuthUser();

    const { data: tokenData } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser, // this will run only when authUser is available
    });

    useEffect(() => {
        const initChat = async () => {
            if (!tokenData?.token || !authUser) return;
            try {
                console.log("Initializing Stream Chat Client...");
                // Disconnect previous client if exists
                if (chatClient) {
                    await chatClient.disconnect();
                }
                const client = StreamChat.getInstance(STREAM_API_KEY);
                await client.connectUser(
                    {
                        id: authUser._id,
                        name: authUser.fullName,
                        image: authUser.profilePic,
                    },
                    tokenData.token
                );

                const channelId = [authUser._id, targetUserId].sort().join("-");
                const currChannel = client.channel("messaging", channelId, {
                    members: [authUser._id, targetUserId],
                });
                await currChannel.watch();
                setChatClient(client);
                setChannel(currChannel);
            } catch (error) {
                console.log("Error initailizing Chat:", error);
                toast.error("Could not connect to Chat.Please Try again");
            } finally {
                setLoading(false);
            }
        };
        initChat();
        // Cleanup: disconnect client on unmount
        return () => {
            if (chatClient) {
                chatClient.disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenData, authUser, targetUserId]);

    const handleVideoCall = () => {
        if (channel) {
            const callUrl = `${window.location.origin}/call/${channel.id}`;
            channel.sendMessage({
                text:`I have started a video call.Join me here: ${callUrl}`,
            })
            toast.success("Video Call link sent successfully!")
        }
    }

    if (loading || !chatClient || !channel) return <ChatLoader />;

    return (
        <div className="h-[93vh]">
            <Chat client={chatClient}>
                <Channel channel={channel}>
                    <div className="w-full relative">
                        <CallButton handleVideoCall={handleVideoCall} />
                        <Window>
                            <ChannelHeader />
                            <MessageList />
                            <MessageInput focus />
                        </Window>
                    </div>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    );
}
