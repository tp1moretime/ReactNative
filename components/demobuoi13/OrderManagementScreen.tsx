import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  OrderItem,
  OrderWithUser,
  fetchAllOrders,
  fetchOrderItems,
  updateOrderStatus,
} from '../../database/database';
import { useUser } from './UserContext';
import Header from './Header';
import { HomeStackParamList } from './types';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

const OrderManagementScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { currentUser } = useUser();
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [itemsMap, setItemsMap] = useState<Record<number, OrderItem[]>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (currentUser?.role === 'admin') {
        load();
      }
    }, [currentUser, load])
  );

  const handleExpand = async (orderId: number) => {
    if (expanded === orderId) {
      setExpanded(null);
      return;
    }
    if (!itemsMap[orderId]) {
      const items = await fetchOrderItems(orderId);
      setItemsMap((prev) => ({ ...prev, [orderId]: items }));
    }
    setExpanded(orderId);
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, status);
    load();
    setUpdatingId(null);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.center}>
          <Text style={styles.centerText}>Chỉ quản trị viên mới truy cập được trang này.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📦 Quản trị đơn hàng</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {orders.map((order) => (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Đơn #{order.id}</Text>
                  <Text style={styles.cardSubtitle}>Khách: {order.username ?? 'N/A'}</Text>
                  <Text style={styles.cardSubtitle}>
                    Ngày: {new Date(order.createdAt).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.total}>
                  {order.totalAmount.toLocaleString()} đ
                </Text>
              </View>

              {order.shippingAddress ? (
                <Text style={styles.infoText}>📍 {order.shippingAddress}</Text>
              ) : null}
              {order.note ? <Text style={styles.infoText}>📝 {order.note}</Text> : null}

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Trạng thái:</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                    enabled={updatingId !== order.id}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <Picker.Item key={status} label={status} value={status} />
                    ))}
                  </Picker>
                </View>
              </View>

              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => handleExpand(order.id)}
              >
                <Text style={styles.expandButtonText}>
                  {expanded === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </Text>
              </TouchableOpacity>

              {expanded === order.id &&
                (itemsMap[order.id]?.length ? (
                  <View style={styles.itemsContainer}>
                    {itemsMap[order.id].map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Text style={styles.itemName}>
                          {item.name} x{item.quantity}
                        </Text>
                        <Text style={styles.itemPrice}>
                          {(item.price * item.quantity).toLocaleString()} đ
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.loadingItems}>Đang tải danh sách sản phẩm...</Text>
                ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { color: '#475569', fontSize: 14, textAlign: 'center' },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  cardSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  total: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  infoText: {
    marginTop: 8,
    color: '#475569',
    fontSize: 13,
  },
  statusRow: {
    marginTop: 12,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: '#475569',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  expandButton: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 10,
  },
  expandButtonText: {
    textAlign: 'right',
    color: '#2563EB',
    fontWeight: '600',
  },
  itemsContainer: {
    marginTop: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 13,
    color: '#0F172A',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA580C',
  },
  loadingItems: {
    color: '#64748B',
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default OrderManagementScreen;

