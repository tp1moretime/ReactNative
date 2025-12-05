import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import CategorySelector from '../demobuoi13/CategorySelector';
import { fetchCategories, Category, addToCart } from '../../database/database'; // giả sử bạn có database.ts với fetchCategories
import { useUser } from './UserContext';

type DetailsScreenProps = NativeStackScreenProps<HomeStackParamList, 'Details'>;

const DetailsScreen = ({ route, navigation }: DetailsScreenProps) => {
  const { product } = route.params;
  const { currentUser } = useUser();

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await fetchCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  // 🔥 HÀM XỬ LÝ ẢNH
  const getImageSource = (img: string): ImageSourcePropType => {
    if (img.startsWith('file://')) return { uri: img };

    switch (img) {
      case 'aothun.jpg': return require('../../assets/images/hinh1.jpg');
      case 'shoesDRM.jpg': return require('../../assets/images/hinh1.jpg');
      case 'balo.jpg': return require('../../assets/images/hinh1.jpg');
      case 'hat.jpg': return require('../../assets/images/hinh1.jpg');
      case 'tui.jpg': return require('../../assets/images/hinh1.jpg');
      default: return require('../../assets/images/hinh1.jpg');
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.', [
        { text: 'Đóng', style: 'cancel' },
        {
          text: 'Đăng nhập',
          onPress: () => navigation.getParent()?.navigate('Login'),
        },
      ]);
      return;
    }
    await addToCart(currentUser.id, product.id, 1);
    Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng!');
  };

  // 🔥 CALLBACK khi nhấn vào category → điều hướng sang ProductsByCategory
  const handleSelectCategory = (id: number) => {
    const selected = categories.find(c => c.id === id);
    if (selected) {
      navigation.navigate('ProductsByCategory', {
        categoryId: selected.id,
        categoryName: selected.name,
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chi Tiết Sản Phẩm</Text>

      {/* ẢNH SẢN PHẨM */}
      <Image
        source={getImageSource(product.img)}
        style={styles.productImage}
        resizeMode="cover"
      />

      {/* THÔNG TIN SẢN PHẨM */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{product.id}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Tên:</Text>
        <Text style={styles.value}>{product.name}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Giá:</Text>
        <Text style={styles.value}>{product.price.toLocaleString()} đ</Text>
      </View>

      <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
        <Text style={styles.cartButtonText}>🛒 Thêm vào giỏ</Text>
      </TouchableOpacity>

      {/* CATEGORY SELECTOR */}
      <Text style={styles.labelCategory}>Xem sản phẩm theo loại:</Text>
      <CategorySelector
        categories={categories}
        selectedId={product.categoryId} // highlight category hiện tại
        onSelect={handleSelectCategory} // click → điều hướng
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  productImage: { width: '100%', height: 260, borderRadius: 12, marginBottom: 25 },
  infoBox: { flexDirection: 'row', marginVertical: 6 },
  label: { width: 90, fontWeight: '600', fontSize: 16, color: '#555' },
  value: { fontSize: 16, color: '#222' },
  labelCategory: { marginTop: 20, fontSize: 16, fontWeight: 'bold', color: '#333' },
  cartButton: {
    marginTop: 16,
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default DetailsScreen;

