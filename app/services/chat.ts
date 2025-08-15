import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export interface ChatMessage {
  id?: string
  sender: string
  text: string
  timestamp: Timestamp
}

export interface Chat {
  id?: string
  participants: string[]
  messages: ChatMessage[]
  lastUpdated: Timestamp
}

export const createChat = async (userId: string, vendorId: string, initialMessage: string): Promise<string> => {
  try {
    const chat: Omit<Chat, "id"> = {
      participants: [userId, vendorId],
      messages: [
        {
          sender: userId,
          text: initialMessage,
          timestamp: Timestamp.now(),
        },
      ],
      lastUpdated: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, "chats"), chat)
    return docRef.id
  } catch (error) {
    console.error("Error creating chat:", error)
    throw new Error("Failed to create chat")
  }
}

export const fetchUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("lastUpdated", "desc"),
    )
    const snapshot = await getDocs(q)
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Chat[]
    return chats
  } catch (error) {
    console.error("Error fetching user chats:", error)
    throw new Error("Failed to fetch chats")
  }
}
