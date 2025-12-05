import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import {
  CartItemWithProduct,
  createOrder,
  fetchCartItemsByUser,
} from '../../database/database';
import Header from './Header';
import { HomeStackParamList } from './types';
import { useUser } from './UserContext';

const CheckoutScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { currentUser } = useUser();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      const cartData = await fetchCartItemsByUser(currentUser.id);
      setItems(cartData);
    };
    load();
  }, [currentUser]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!currentUser) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để đặt hàng.');
      return;
    }
    if (!items.length) {
      Alert.alert('Thông báo', 'Giỏ hàng đang trống.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ giao hàng.');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderId = await createOrder(
        currentUser.id,
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        address.trim(),
        note.trim() || undefined
      );

      if (orderId) {
        Alert.alert('Thành công', 'Đặt hàng thành công!', [
          {
            text: 'Xem lịch sử',
            onPress: () => navigation.navigate('OrderHistory'),
          },
        ]);
        setAddress('');
        setNote('');
        navigation.navigate('OrderHistory');
      } else {
        Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.center}>
          <Text style={styles.centerText}>Vui lòng đăng nhập để thanh toán.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.body}>
        <Text style={styles.title}>🧾 Thanh toán</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <TextInput
            style={styles.input}
            placeholder="Địa chỉ giao hàng"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ghi chú cho cửa hàng (tuỳ chọn)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng ({items.length} sản phẩm)</Text>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.orderRow}>
                <View>
                  <Text style={styles.orderName}>{item.name}</Text>
                  <Text style={styles.orderQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.orderPrice}>
                  {(item.price * item.quantity).toLocaleString()} đ
                </Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.centerText}>Giỏ hàng đang trống.</Text>}
          />
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()} đ</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, (!items.length || isSubmitting) && styles.disabled]}
          onPress={handleCheckout}
          disabled={!items.length || isSubmitting}
        >
          <Text style={styles.checkoutText}>
            {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng ngay'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  body: { flex: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    color: '#0F172A',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    color: '#475569',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0F172A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  orderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  orderQuantity: {
    fontSize: 12,
    color: '#94A3B8',
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  checkoutButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default CheckoutScreen;

