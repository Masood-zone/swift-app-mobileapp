import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { AdminOrder } from "../../services/admin/orders";
import {
  fetchAllOrdersAdmin,
  getOrderStats,
  updateOrderDeliveryAddress,
  updateOrderStatus,
} from "../../services/admin/orders";

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  "on-the-way": "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  "on-the-way": "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderTrackingScreen() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [stats, setStats] = useState<any>(null);

  const loadData = async () => {
    try {
      const [ordersData, statsData] = await Promise.all([
        fetchAllOrdersAdmin(),
        getOrderStats(),
      ]);
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => order.status === selectedStatus)
      );
    }
  }, [selectedStatus, orders]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: AdminOrder["status"]
  ) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
      Alert.alert("Success", "Order status updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update order status");
    }
  };

  const handleAddressUpdate = async () => {
    if (!selectedOrder || !newAddress.trim()) return;

    try {
      await updateOrderDeliveryAddress(selectedOrder.id, newAddress.trim());
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, deliveryAddress: newAddress.trim() }
            : order
        )
      );
      setSelectedOrder((prev) =>
        prev ? { ...prev, deliveryAddress: newAddress.trim() } : null
      );
      setEditingAddress(false);
      setNewAddress("");
      Alert.alert("Success", "Delivery address updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update delivery address");
    }
  };

  const openOrderDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setNewAddress(order.deliveryAddress);
    setModalVisible(true);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const renderOrderCard = ({ item }: { item: AdminOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => openOrderDetails(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>
          Order #{item.id.slice(-6).toUpperCase()}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[item.status] },
          ]}
        >
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.customerName}>
          {item.userName || "Unknown Customer"}
        </Text>
        <Text style={styles.customerEmail}>{item.userEmail || "No email"}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.itemCount}>{item.items.length} items</Text>
        <Text style={styles.totalAmount}>Ghc{item.total}</Text>
      </View>

      <Text style={styles.deliveryAddress} numberOfLines={1}>
        📍 {item.deliveryAddress}
      </Text>
    </TouchableOpacity>
  );

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Order Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.todayOrders}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              Ghc{stats.totalRevenue.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {renderStatsCard()}

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Status:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value)}
              style={styles.picker}
            >
              <Picker.Item label="All Orders" value="all" />
              <Picker.Item label="Pending" value="pending" />
              <Picker.Item label="Confirmed" value="confirmed" />
              <Picker.Item label="Preparing" value="preparing" />
              <Picker.Item label="On the Way" value="on-the-way" />
              <Picker.Item label="Delivered" value="delivered" />
              <Picker.Item label="Cancelled" value="cancelled" />
            </Picker>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              Orders will appear here when customers place them
            </Text>
          </View>
        }
      />

      {/* Order Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Information</Text>
                <Text style={styles.detailText}>
                  Order ID: #{selectedOrder.id.slice(-6).toUpperCase()}
                </Text>
                <Text style={styles.detailText}>
                  Date: {formatDate(selectedOrder.createdAt)}
                </Text>
                <Text style={styles.detailText}>
                  Customer: {selectedOrder.userName || "Unknown"}
                </Text>
                <Text style={styles.detailText}>
                  Email: {selectedOrder.userEmail || "No email"}
                </Text>
                <Text style={styles.detailText}>
                  Total: ${selectedOrder.total.toFixed(2)}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status Management</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedOrder.status}
                    onValueChange={(value) =>
                      handleStatusUpdate(selectedOrder.id, value)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Pending" value="pending" />
                    <Picker.Item label="Confirmed" value="confirmed" />
                    <Picker.Item label="Preparing" value="preparing" />
                    <Picker.Item label="On the Way" value="on-the-way" />
                    <Picker.Item label="Delivered" value="delivered" />
                    <Picker.Item label="Cancelled" value="cancelled" />
                  </Picker>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                  <TouchableOpacity
                    onPress={() => setEditingAddress(!editingAddress)}
                  >
                    <Ionicons name="pencil" size={20} color="#2563eb" />
                  </TouchableOpacity>
                </View>
                {editingAddress ? (
                  <View style={styles.addressEditContainer}>
                    <TextInput
                      style={styles.addressInput}
                      value={newAddress}
                      onChangeText={setNewAddress}
                      multiline
                      numberOfLines={3}
                    />
                    <View style={styles.addressActions}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleAddressUpdate}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setEditingAddress(false);
                          setNewAddress(selectedOrder.deliveryAddress);
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.addressText}>
                    {selectedOrder.deliveryAddress}
                  </Text>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      Qty: {item.quantity} × Ghc{item.price.toFixed(2)} = $
                      {(item.quantity * item.price).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
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
    height: "auto",
  },
  filterLabel: {
    fontSize: 14,
    height: 32,
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
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  orderInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  customerEmail: {
    fontSize: 12,
    color: "#6b7280",
  },
  orderDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },
  deliveryAddress: {
    fontSize: 12,
    color: "#6b7280",
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
  addressText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  addressEditContainer: {
    gap: 12,
  },
  addressInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
  addressActions: {
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
  orderItem: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: "#6b7280",
  },
});
