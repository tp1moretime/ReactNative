import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import {
  CartItemWithProduct,
  fetchCartItemsByUser,
  removeCartItem,
  updateCartItemQuantity,
} from '../../database/database';
import Header from './Header';
import { HomeStackParamList } from './types';
import { useUser } from './UserContext';

const CartScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { currentUser } = useUser();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCart = useCallback(async () => {
    if (!currentUser) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const data = await fetchCartItemsByUser(currentUser.id);
    setItems(data);
    setIsLoading(false);
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  const handleQuantityChange = async (item: CartItemWithProduct, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      await handleRemove(item.id);
      return;
    }
    await updateCartItemQuantity(item.id, newQuantity);
    loadCart();
  };

  const handleRemove = async (itemId: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await removeCartItem(itemId);
          loadCart();
        },
      },
    ]);
  };

  const getImageSource = (img: string) => {
    if (img?.startsWith?.('file://')) return { uri: img };
    switch (img) {
      case 'aothun.jpg':
      case 'shoesDRM.jpg':
      case 'balo.jpg':
      case 'hat.jpg':
      case 'tui.jpg':
      default:
        return require('../../assets/images/hinh1.jpg');
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.centerMessage}>
          <Text style={styles.centerText}>Vui lòng đăng nhập để xem giỏ hàng.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.body}>
        <Text style={styles.title}>🛒 Giỏ hàng của bạn</Text>
        {isLoading ? (
          <View style={styles.centerMessage}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={items.length ? undefined : styles.emptyContainer}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Image source={getImageSource(item.img)} style={styles.image} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardPrice}>{item.price.toLocaleString()} đ</Text>
                    <View style={styles.quantityRow}>
                      <TouchableOpacity
                        onPress={() => handleQuantityChange(item, -1)}
                        style={styles.qtyButton}
                      >
                        <Text style={styles.qtyButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => handleQuantityChange(item, 1)}
                        style={styles.qtyButton}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item.id)}>
                    <Text style={styles.removeText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.centerText}>Giỏ hàng đang trống. Hãy thêm sản phẩm nhé!</Text>
              }
            />

            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Tổng cộng:</Text>
              <Text style={styles.summaryValue}>{total.toLocaleString()} đ</Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.secondaryText}>Tiếp tục mua sắm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, items.length === 0 && styles.disabled]}
                disabled={!items.length}
                onPress={() => navigation.navigate('Checkout')}
              >
                <Text style={styles.primaryText}>Thanh toán</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  body: { flex: 1, padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  centerMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardPrice: {
    fontSize: 13,
    color: '#DC2626',
    marginTop: 4,
    marginBottom: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  removeText: {
    fontSize: 20,
    marginLeft: 10,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  summaryLabel: { fontSize: 16, color: '#475569' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#22C55E',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
  },
  secondaryText: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default CartScreen;

