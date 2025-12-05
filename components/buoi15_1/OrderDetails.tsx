import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "./types";
import { fetchOrderDetails, updateOrderStatus } from "../database";

type Props = NativeStackScreenProps<HomeStackParamList, "OrderDetails">;

const OrderDetails = ({ route, navigation }: Props) => {
  const { orderId, onStatusChange } = route.params;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, []);

  const loadOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await fetchOrderDetails(orderId);

      const fetchedOrder = res.order;
      const items = res.items;

      setOrder({
        ...(fetchedOrder as object),
        items,
      });
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Lỗi", "Không thể tải chi tiết đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'pending' | 'shipping' | 'completed' | 'cancelled') => {
    if (!order) return;
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      if (onStatusChange) onStatusChange(newStatus); // 🔥 cập nhật danh sách ở màn hình trước
      Alert.alert("✔ Thành công", "Cập nhật trạng thái đơn hàng!");
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Lỗi", "Không thể cập nhật trạng thái!");
    }
  };

  const renderStatusBadge = (status: string) => {
    let text = "", color = "";
    switch (status) {
      case "pending": text = "Chờ xác nhận"; color = "#F59E0B"; break;
      case "shipping": text = "Đang giao"; color = "#3B82F6"; break;
      case "completed": text = "Hoàn thành"; color = "#16A34A"; break;
      case "cancelled": text = "Đã hủy"; color = "#EF4444"; break;
    }
    return (
      <View style={[styles.badge, { backgroundColor: color + "22", borderColor: color }]}>
        <Text style={[styles.badgeText, { color }]}>{text}</Text>
      </View>
    );
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={{ marginTop: 10 }}>Đang tải chi tiết đơn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn #{order.id}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          <Text style={styles.itemText}>👤 Khách hàng: {order.userId}</Text>
          <Text style={styles.itemText}>📅 Ngày đặt: {order.date}</Text>
          <View style={{ marginTop: 10 }}>{renderStatusBadge(order.status)}</View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          {order.items.map((item: any, index: number) => (
            <View key={index} style={styles.productRow}>
              <View>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productQty}>Số lượng: {item.quantity}</Text>
              </View>
              <Text style={styles.productPrice}>
                {item.price.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalPrice}>{order.total.toLocaleString("vi-VN")}đ</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cập nhật trạng thái</Text>
          {[
            { label: "Chờ xác nhận", value: "pending" },
            { label: "Đang giao", value: "shipping" },
            { label: "Hoàn thành", value: "completed" },
            { label: "Hủy đơn", value: "cancelled" },
          ].map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.statusBtn, order.status === s.value && styles.statusBtnActive]}
              onPress={() => updateStatus(s.value as any)}
            >
              <Text style={[styles.statusBtnText, order.status === s.value && styles.statusBtnTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { backgroundColor: "#16A34A", flexDirection: "row", alignItems: "center", padding: 15 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginLeft: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#166534", marginBottom: 10 },
  itemText: { fontSize: 15, marginBottom: 5, color: "#333" },
  productRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 10 },
  productName: { fontSize: 15, fontWeight: "600" },
  productQty: { fontSize: 13, color: "#555" },
  productPrice: { fontSize: 15, fontWeight: "700", color: "#DC2626" },
  totalLabel: { fontSize: 16, fontWeight: "600", color: "#444" },
  totalPrice: { fontSize: 22, fontWeight: "700", color: "#DC2626", marginTop: 5 },
  statusBtn: { paddingVertical: 10, marginVertical: 5, borderRadius: 10, backgroundColor: "#E5E7EB", alignItems: "center" },
  statusBtnActive: { backgroundColor: "#16A34A" },
  statusBtnText: { color: "#444", fontWeight: "600" },
  statusBtnTextActive: { color: "#fff" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "700" },
});
