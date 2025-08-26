"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { Ionicons } from "@expo/vector-icons"
import {
  fetchAllUsersAdmin,
  updateUserRole,
  updateUserStatus,
  updateUserProfile,
  deleteUser,
  getUserStats,
} from "../../services/admin/users"
import type { AdminUserProfile } from "../../services/admin/users"

const STATUS_COLORS = {
  active: "#10b981",
  suspended: "#f59e0b",
  banned: "#ef4444",
}

const STATUS_LABELS = {
  active: "Active",
  suspended: "Suspended",
  banned: "Banned",
}

export function UserManagementScreen() {
  const [users, setUsers] = useState<AdminUserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUserProfile[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserProfile | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const [adminPermissions, setAdminPermissions] = useState({
    canManageRestaurants: false,
    canManageMenus: false,
    canManageOrders: false,
    canManageUsers: false,
  })

  const loadData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([fetchAllUsersAdmin(), getUserStats()])
      setUsers(usersData)
      setFilteredUsers(usersData)
      setStats(statsData)
    } catch (error) {
      Alert.alert("Error", "Failed to load users")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = users
    switch (selectedFilter) {
      case "admin":
        filtered = users.filter((user) => user.role === "admin")
        break
      case "active":
        filtered = users.filter((user) => user.status === "active" || !user.status)
        break
      case "suspended":
        filtered = users.filter((user) => user.status === "suspended")
        break
      case "banned":
        filtered = users.filter((user) => user.status === "banned")
        break
      default:
        filtered = users
    }
    setFilteredUsers(filtered)
  }, [selectedFilter, users])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleRoleUpdate = async (uid: string, newRole: "user" | "admin") => {
    try {
      const permissions = newRole === "admin" ? adminPermissions : undefined
      await updateUserRole(uid, newRole, permissions)
      setUsers((prev) =>
        prev.map((user) =>
          user.uid === uid
            ? { ...user, role: newRole, isAdmin: newRole === "admin", adminPermissions: permissions }
            : user,
        ),
      )
      if (selectedUser?.uid === uid) {
        setSelectedUser((prev) =>
          prev ? { ...prev, role: newRole, isAdmin: newRole === "admin", adminPermissions: permissions } : null,
        )
      }
      Alert.alert("Success", "User role updated successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to update user role")
    }
  }

  const handleStatusUpdate = async (uid: string, newStatus: "active" | "suspended" | "banned") => {
    try {
      await updateUserStatus(uid, newStatus)
      setUsers((prev) => prev.map((user) => (user.uid === uid ? { ...user, status: newStatus } : user)))
      if (selectedUser?.uid === uid) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
      Alert.alert("Success", "User status updated successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to update user status")
    }
  }

  const handleProfileUpdate = async () => {
    if (!selectedUser) return

    try {
      await updateUserProfile(selectedUser.uid, profileForm)
      setUsers((prev) => prev.map((user) => (user.uid === selectedUser.uid ? { ...user, ...profileForm } : user)))
      setSelectedUser((prev) => (prev ? { ...prev, ...profileForm } : null))
      setEditingProfile(false)
      Alert.alert("Success", "User profile updated successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to update user profile")
    }
  }

  const handleDeleteUser = (user: AdminUserProfile) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete "${user.name}"? This action cannot be undone and will remove all user data.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user.uid)
              setUsers((prev) => prev.filter((u) => u.uid !== user.uid))
              setModalVisible(false)
              Alert.alert("Success", "User deleted successfully")
            } catch (error) {
              Alert.alert("Error", "Failed to delete user")
            }
          },
        },
      ],
    )
  }

  const openUserDetails = (user: AdminUserProfile) => {
    setSelectedUser(user)
    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
    })
    setAdminPermissions(
      user.adminPermissions || {
        canManageRestaurants: false,
        canManageMenus: false,
        canManageOrders: false,
        canManageUsers: false,
      },
    )
    setModalVisible(true)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  const renderUserCard = ({ item }: { item: AdminUserProfile }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => openUserDetails(item)}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={styles.badges}>
          {item.role === "admin" && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status || "active"] }]}>
            <Text style={styles.statusText}>{STATUS_LABELS[item.status || "active"]}</Text>
          </View>
        </View>
      </View>

      <View style={styles.userStats}>
        <Text style={styles.statText}>Orders: {item.totalOrders || 0}</Text>
        <Text style={styles.statText}>Spent: ${(item.totalSpent || 0).toFixed(2)}</Text>
        <Text style={styles.statText}>Joined: {formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderStatsCard = () => {
    if (!stats) return null

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>User Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.adminUsers}</Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.newUsersToday}</Text>
            <Text style={styles.statLabel}>New Today</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {renderStatsCard()}

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter Users:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedFilter}
              onValueChange={(value) => setSelectedFilter(value)}
              style={styles.picker}
            >
              <Picker.Item label="All Users" value="all" />
              <Picker.Item label="Admins" value="admin" />
              <Picker.Item label="Active" value="active" />
              <Picker.Item label="Suspended" value="suspended" />
              <Picker.Item label="Banned" value="banned" />
            </Picker>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>Users will appear here when they register</Text>
          </View>
        }
      />

      {/* User Details Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {selectedUser && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Information</Text>
                <Text style={styles.detailText}>ID: {selectedUser.uid}</Text>
                <Text style={styles.detailText}>Email: {selectedUser.email}</Text>
                <Text style={styles.detailText}>Joined: {formatDate(selectedUser.createdAt)}</Text>
                <Text style={styles.detailText}>Orders: {selectedUser.totalOrders || 0}</Text>
                <Text style={styles.detailText}>Total Spent: ${(selectedUser.totalSpent || 0).toFixed(2)}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Role Management</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedUser.role || "user"}
                    onValueChange={(value) => handleRoleUpdate(selectedUser.uid, value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="User" value="user" />
                    <Picker.Item label="Admin" value="admin" />
                  </Picker>
                </View>

                {selectedUser.role === "admin" && (
                  <View style={styles.permissionsContainer}>
                    <Text style={styles.permissionsTitle}>Admin Permissions</Text>
                    {Object.entries(adminPermissions).map(([key, value]) => (
                      <View key={key} style={styles.permissionRow}>
                        <Text style={styles.permissionLabel}>
                          {key.replace("canManage", "Manage ").replace(/([A-Z])/g, " $1")}
                        </Text>
                        <Switch
                          value={value}
                          onValueChange={(newValue) => setAdminPermissions((prev) => ({ ...prev, [key]: newValue }))}
                        />
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.updatePermissionsButton}
                      onPress={() => handleRoleUpdate(selectedUser.uid, "admin")}
                    >
                      <Text style={styles.updatePermissionsText}>Update Permissions</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status Management</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedUser.status || "active"}
                    onValueChange={(value) => handleStatusUpdate(selectedUser.uid, value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Active" value="active" />
                    <Picker.Item label="Suspended" value="suspended" />
                    <Picker.Item label="Banned" value="banned" />
                  </Picker>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Profile Information</Text>
                  <TouchableOpacity onPress={() => setEditingProfile(!editingProfile)}>
                    <Ionicons name="pencil" size={20} color="#2563eb" />
                  </TouchableOpacity>
                </View>

                {editingProfile ? (
                  <View style={styles.profileEditContainer}>
                    <TextInput
                      style={styles.input}
                      value={profileForm.name}
                      onChangeText={(text) => setProfileForm((prev) => ({ ...prev, name: text }))}
                      placeholder="Name"
                    />
                    <TextInput
                      style={styles.input}
                      value={profileForm.phone}
                      onChangeText={(text) => setProfileForm((prev) => ({ ...prev, phone: text }))}
                      placeholder="Phone"
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={profileForm.address}
                      onChangeText={(text) => setProfileForm((prev) => ({ ...prev, address: text }))}
                      placeholder="Address"
                      multiline
                      numberOfLines={3}
                    />
                    <View style={styles.profileActions}>
                      <TouchableOpacity style={styles.saveButton} onPress={handleProfileUpdate}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setEditingProfile(false)
                          setProfileForm({
                            name: selectedUser.name || "",
                            phone: selectedUser.phone || "",
                            address: selectedUser.address || "",
                          })
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.profileText}>Name: {selectedUser.name || "Not provided"}</Text>
                    <Text style={styles.profileText}>Phone: {selectedUser.phone || "Not provided"}</Text>
                    <Text style={styles.profileText}>Address: {selectedUser.address || "Not provided"}</Text>
                  </View>
                )}
              </View>

              <View style={styles.dangerZone}>
                <Text style={styles.dangerTitle}>Danger Zone</Text>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(selectedUser)}>
                  <Ionicons name="trash" size={20} color="#ffffff" />
                  <Text style={styles.deleteButtonText}>Delete User</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 16,
    gap: 16,
  },
  statsContainer: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  filterContainer: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  picker: {
    height: 40,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  badges: {
    gap: 4,
  },
  adminBadge: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  adminBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  statusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  permissionsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  permissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  permissionLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  updatePermissionsButton: {
    backgroundColor: "#2563eb",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  updatePermissionsText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  profileEditContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  profileActions: {
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  profileText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  dangerZone: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 6,
    gap: 8,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
})
