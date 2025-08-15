import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../../contexts/auth/AuthContext";
import { fetchUserChats, createChat } from "../../services/chat";

export default function ChatListScreen() {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadChats = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchUserChats(user.uid);
        setChats(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch chats");
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, [user]);

  const handleCreateChat = async () => {
    if (!message.trim()) {
      Alert.alert("Missing Message", "Please enter a message to start a chat.");
      return;
    }
    if (!user) {
      Alert.alert("Not logged in", "Please log in to start a chat.");
      return;
    }
    setCreating(true);
    try {
      await createChat(user.uid, user.uid, message.trim());
      setMessage("");
      // Refresh chat list
      const data = await fetchUserChats(user.uid);
      setChats(data);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create chat");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message to start a chat"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          style={styles.createBtn}
          onPress={handleCreateChat}
          disabled={creating}
        >
          <Text style={styles.createBtnText}>
            {creating ? "Creating..." : "Start Chat"}
          </Text>
        </TouchableOpacity>
      </View>
      {chats.length === 0 ? (
        <Text style={styles.subtitle}>No conversations found.</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.chatCard}>
              <Text style={styles.chatId}>Chat #{item.id}</Text>
              <Text>Participants: {item.participants?.join(", ")}</Text>
              <Text>
                Last Updated:{" "}
                {item.lastUpdated?.toDate?.().toLocaleString?.() || "-"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  chatCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  chatId: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    marginRight: 8,
  },
  createBtn: {
    backgroundColor: "#FF6B6B",
    borderRadius: 4,
    padding: 12,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
