import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';

import { Product, fetchProducts, initDatabase } from '../database/database';

const FALLBACK_IMAGE = require('../assets/images/hinh1.jpg');

const productImage = (img?: string) => {
  switch (img) {
    case 'aothun.jpg':
    case 'shoesDRM.jpg':
    case 'balo.jpg':
    case 'hat.jpg':
    case 'tui.jpg':
      return FALLBACK_IMAGE;
    default:
      return FALLBACK_IMAGE;
  }
};

const ProductCard = ({ item }: { item: Product }) => (
  <View style={styles.card}>
    <Image source={productImage(item.img)} style={styles.image} />
    <Text style={styles.name} numberOfLines={2}>
      {item.name}
    </Text>
    <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
  </View>
);

const UserHome = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      try {
        await initDatabase();
        const data = await fetchProducts();
        if (mounted) {
          setProducts(data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Các sản phẩm sẵn có</Text>
      <FlatList
        data={products}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={products.length ? styles.listContent : styles.emptyContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#0f172a',
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
  price: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#475569',
  },
  emptyText: {
    fontSize: 14,
    color: '#475569',
  },
});

export default UserHome;

