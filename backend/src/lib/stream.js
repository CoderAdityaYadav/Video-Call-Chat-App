import { StreamChat } from "stream-chat"
import "dotenv/config"

const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) console.error("Stream API key or Secret is missing")
    
const streamClient = StreamChat.getInstance(apiKey, apiSecret)

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData])
        return userData
    } catch (error) {
        console.error("Error Upserting Stream User:", error)
    }
}

export const generateStreamToken = (userId) => {
    try {
        // ensure user id is a string
        const userIdStr = userId.toString()
         return streamClient.createToken(userIdStr)
    } catch (error) {
        console.log("Error generating Stream Token:",error)
    }
}