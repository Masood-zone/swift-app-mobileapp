"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../../contexts/auth/AuthContext";
import { fetchUserChats } from "../../services/chat";

export default function ChatListScreen() {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <Text style={styles.title}>Chats</Text>
        <Text style={styles.subtitle}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
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
});
