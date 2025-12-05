import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchOrders, updateOrderStatus as updateOrderStatusDB } from "../../database";
import { HomeStackParamList } from "../types";

const OrderManagement = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Lỗi", "Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = (status: string) => {
    setSelectedStatus(status);
    if (status === "all") {
      setFiltered(orders);
    } else {
      setFiltered(orders.filter((o) => o.status === status));
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatusDB(orderId, newStatus);  // 🔥 GHI DB
      loadOrders(); // refresh
    } catch (err) {
      Alert.alert("❌ Lỗi", "Không thể cập nhật trạng thái đơn hàng!");
    }
  };

  const nextStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "shipping";
      case "shipping":
        return "completed";
      default:
        return null;
    }
  };

  const renderStatusBadge = (status: string) => {
    let text = "";
    let color = "";

    switch (status) {
      case "pending":
        text = "Chờ xác nhận";
        color = "#FFD54F"; // Vàng nhạt
        break;
      case "shipping":
        text = "Đang giao";
        color = "#4FC3F7"; // Xanh dương nhạt
        break;
      case "completed":
        text = "Hoàn thành";
        color = "#BB86FC"; // Tím Nhấn
        break;
      case "cancelled":
        text = "Đã hủy";
        color = "#CF6679"; // Đỏ Cảnh báo
        break;
    }

    // Sử dụng màu nền tối và viền
    return (
      <View style={[styles.badge, { backgroundColor: '#121212', borderColor: color }]}>
        <Text style={[styles.badgeText, { color }]}>{text}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: any) => {
    const next = nextStatus(item.status);

    return (
      <View style={styles.orderCard}>
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Đơn #{item.id}</Text>
          {renderStatusBadge(item.status)}
        </View>

        <View style={styles.row}>
          <Ionicons name="person-circle-outline" size={18} color="#BB86FC" />
          <Text style={styles.orderText}>Khách hàng: {item.userId}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={18} color="#BB86FC" />
          <Text style={styles.orderText}>Ngày đặt: {item.date}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="cube-outline" size={18} color="#B3B3B3" />
          <Text style={styles.orderText}>Số SP: {item.itemCount}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="card-outline" size={18} color="#B3B3B3" />
          <Text style={styles.orderText}>
            Thanh toán: {item.paymentMethod?.toUpperCase() || "COD"}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="cash-outline" size={18} color="#03DAC6" />
          <Text style={styles.totalPrice}>
            {item.total.toLocaleString("vi-VN")}đ
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionRow}>
          {next && (
            <TouchableOpacity
              style={styles.statusBtn}
              onPress={async () => {
                await updateOrderStatus(item.id, next);
                loadOrders();
              }}
            >
              <Text style={styles.statusBtnText}>
                {next === "shipping" ? "Giao hàng" : "Hoàn thành"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              Alert.alert("Hủy đơn", "Bạn có chắc muốn hủy đơn này?", [
                { text: "Không", style: "cancel" },
                {
                  text: "Có",
                  style: "destructive",
                  onPress: async () => {
                    await updateOrderStatus(item.id, "cancelled");
                    loadOrders();
                    setFiltered([...filtered]);
                  }
                },
              ]);
            }}
          >
            <Text style={styles.cancelBtnText}>Hủy đơn</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#121212" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Đơn hàng</Text>
      </View>

      {/* FILTER */}
      <View style={styles.filterRow}>
        {[
          { label: "Tất cả", value: "all" },
          { label: "Chờ xác nhận", value: "pending" },
          { label: "Đang giao", value: "shipping" },
          { label: "Hoàn thành", value: "completed" },
          { label: "Đã hủy", value: "cancelled" },
        ].map((s) => (
          <TouchableOpacity
            key={s.value}
            onPress={() => filterByStatus(s.value)}
            style={[styles.filterButton, selectedStatus === s.value && styles.filterActive]}
          >
            <Text style={[styles.filterText, selectedStatus === s.value && styles.filterTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#BB86FC" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </View>
  );
};

export default OrderManagement;

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" }, // Nền Tối

  header: {
    backgroundColor: "#BB86FC", // Header Màu Nhấn
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  headerTitle: {
    color: "#121212", // Chữ tối trên nền sáng
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 15,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#1E1E1E", // Filter bar nền tối
    borderBottomWidth: 1,
    borderBottomColor: '#333333'
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333333", // Viền xám
    backgroundColor: '#1E1E1E',
  },

  filterActive: {
    borderColor: "#BB86FC", // Viền Active Màu Nhấn
    backgroundColor: "#2C2C2C", // Nền Active tối hơn
  },

  filterText: {
    color: "#B3B3B3", // Chữ xám
    fontSize: 13,
  },

  filterTextActive: {
    color: "#BB86FC", // Chữ Active Màu Nhấn
    fontWeight: "700",
  },

  orderCard: {
    backgroundColor: "#1E1E1E", // Card nền tối
    padding: 18, // Padding lớn hơn
    borderRadius: 16, // Bo góc lớn hơn
    marginBottom: 12,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  orderId: {
    fontSize: 18, // Lớn hơn
    fontWeight: "700",
    color: "#FFFFFF", // Chữ trắng
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },

  orderText: {
    fontSize: 14,
    color: "#B3B3B3", // Chữ xám
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  totalPrice: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#03DAC6", // Màu Teal cho giá
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 15,
  },

  statusBtn: {
    backgroundColor: "#BB86FC", // Nút trạng thái Màu Nhấn
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },

  statusBtnText: {
    color: "#121212", // Chữ tối
    fontSize: 14,
    fontWeight: "600",
  },

  cancelBtn: {
    borderWidth: 1,
    borderColor: "#CF6679", // Viền Đỏ Cảnh báo
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },

  cancelBtnText: {
    color: "#CF6679", // Chữ Đỏ Cảnh báo
    fontSize: 14,
    fontWeight: "600",
  },
});