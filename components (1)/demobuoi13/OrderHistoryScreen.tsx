import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  Order,
  OrderItem,
  fetchOrderItems,
  fetchOrdersByUser,
} from '../../database/database';
import Header from './Header';
import { useUser } from './UserContext';

const STATUS_COLORS: Record<string, string> = {
  pending: '#FBBF24',
  processing: '#38BDF8',
  shipped: '#A855F7',
  completed: '#22C55E',
  cancelled: '#EF4444',
};

const formatDate = (value: string) => {
  try {
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  } catch {
    return value;
  }
};

const OrderHistoryScreen = () => {
  const { currentUser } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<number, OrderItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<null | number>(null);

  const loadOrders = useCallback(async () => {
    if (!currentUser) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const data = await fetchOrdersByUser(currentUser.id);
    setOrders(data);
    setIsLoading(false);
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const toggleItems = async (orderId: number) => {
    if (expanded === orderId) {
      setExpanded(null);
      return;
    }
    if (!itemsMap[orderId]) {
      const orderItems = await fetchOrderItems(orderId);
      setItemsMap((prev) => ({ ...prev, [orderId]: orderItems }));
    }
    setExpanded(orderId);
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.center}>
          <Text style={styles.centerText}>Vui lòng đăng nhập để xem lịch sử mua hàng.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.body}>
        <Text style={styles.title}>📜 Lịch sử mua hàng</Text>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.centerText}>Bạn chưa có đơn hàng nào.</Text>
          </View>
        ) : (
          orders.map((order) => {
            const badgeColor = STATUS_COLORS[order.status] ?? '#94A3B8';
            const isExpanded = expanded === order.id;
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>Đơn #{order.id}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>

                {order.shippingAddress ? (
                  <Text style={styles.orderAddress}>📍 {order.shippingAddress}</Text>
                ) : null}
                {order.note ? <Text style={styles.orderNote}>📝 {order.note}</Text> : null}

                <View style={styles.orderFooter}>
                  <Text style={styles.totalLabel}>Tổng:</Text>
                  <Text style={styles.totalValue}>{order.totalAmount.toLocaleString()} đ</Text>
                </View>

                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => toggleItems(order.id)}
                >
                  <Text style={styles.expandText}>
                    {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết sản phẩm'}
                  </Text>
                </TouchableOpacity>

                {isExpanded &&
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
                    <Text style={styles.loadingItems}>Đang tải sản phẩm...</Text>
                  ))}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  body: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12, color: '#0F172A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { color: '#475569', fontSize: 14, textAlign: 'center' },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  orderDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  orderAddress: {
    marginTop: 8,
    color: '#475569',
    fontSize: 13,
  },
  orderNote: {
    marginTop: 4,
    color: '#475569',
    fontSize: 13,
    fontStyle: 'italic',
  },
  orderFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 14, color: '#475569' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  expandButton: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 10,
  },
  expandText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'right',
  },
  itemsContainer: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    padding: 10,
    gap: 8,
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
    fontSize: 12,
    marginTop: 8,
  },
});

export default OrderHistoryScreen;

