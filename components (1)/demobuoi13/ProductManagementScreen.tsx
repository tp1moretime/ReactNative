import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  ImageSourcePropType,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "@react-navigation/native";

import {
  initDatabase,
  fetchCategories,
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProductsByNameOrCategory,
  Product,
  Category,
} from '../../database/database';

// CARD SẢN PHẨM VỚI NÚT EDIT/DELETE
const ProductCard = ({
  item,
  onEdit,
  onDelete,
  getImageSource,
}: {
  item: Product;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  getImageSource: (img: string) => ImageSourcePropType;
}) => (
  <View style={styles.card}>
    <Image source={getImageSource(item.img)} style={styles.image} />
    <View style={styles.infoContainer}>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toLocaleString()} đ</Text>
    </View>

    <View style={styles.iconRow}>
      <TouchableOpacity onPress={() => onEdit(item.id)} style={styles.iconButton}>
        <Text style={styles.icon}>✏️</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.iconButton}>
        <Text style={styles.icon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ProductManagementScreen = ({ route }: any) => {
  const navigation: any = useNavigation();
  
  // Lấy initialCategoryId từ route params nếu có
  const initialCategoryId = route?.params?.initialCategoryId;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number>(initialCategoryId || 1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    initDatabase(() => loadData());
    // Nếu có initialCategoryId, set categoryId khi component mount
    if (initialCategoryId) {
      setCategoryId(initialCategoryId);
    }
  }, [initialCategoryId]);

  const loadData = async () => {
    const cats = await fetchCategories();
    const prods = await fetchProducts();
    setCategories(cats);
    setProducts(prods.reverse());
  };

  const handleAddOrUpdate = async () => {
    if (!name || !price) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên và giá sản phẩm.');
      return;
    }
    const productData = {
      name,
      price: parseFloat(price),
      img: imageUri || 'aothun.jpg',
      categoryId,
    };

    try {
      if (editingId !== null) {
        await updateProduct({ id: editingId, ...productData });
        setEditingId(null);
      } else {
        await addProduct(productData);
      }
      setName('');
      setPrice('');
      setCategoryId(1);
      setImageUri(null);
      loadData();
      Alert.alert('Thành công', editingId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleEdit = (id: number) => {
    const p = products.find((x) => x.id === id);
    if (p) {
      setName(p.name);
      setPrice(p.price.toString());
      setCategoryId(p.categoryId);
      setImageUri(p.img);
      setEditingId(p.id);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa sản phẩm này không?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive', 
        onPress: async () => { 
          await deleteProduct(id); 
          loadData();
          Alert.alert('Thành công', 'Đã xóa sản phẩm!');
        } 
      },
    ]);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const getImageSource = (img: string) => {
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

  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.trim() === '') {
      loadData();
    } else {
      const results = await searchProductsByNameOrCategory(keyword);
      setProducts(results.reverse());
    }
  };

  const handleCancelEdit = () => {
    setName('');
    setPrice('');
    setCategoryId(1);
    setImageUri(null);
    setEditingId(null);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛍️ Quản lý sản phẩm</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* FORM THÊM/SỬA SẢN PHẨM */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{editingId ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}</Text>
          
          <TextInput 
            style={styles.input} 
            placeholder="Tên sản phẩm" 
            value={name} 
            onChangeText={setName} 
          />
          
          <TextInput 
            style={styles.input} 
            placeholder="Giá sản phẩm" 
            keyboardType="numeric" 
            value={price} 
            onChangeText={setPrice} 
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Danh mục:</Text>
            <Picker 
              selectedValue={categoryId} 
              onValueChange={setCategoryId}
              style={styles.picker}
            >
              {categories.map((c) => (
                <Picker.Item key={c.id} label={c.name} value={c.id} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            <Text style={styles.buttonText}>
              {imageUri ? '🖼️ Chọn lại hình ảnh' : '📷 Chọn hình ảnh'}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <Image source={getImageSource(imageUri)} style={styles.selectedImage} />
          )}

          <View style={styles.buttonRow}>
            {editingId && (
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelEdit}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]} 
              onPress={handleAddOrUpdate}
            >
              <Text style={styles.buttonText}>
                {editingId ? '💾 Cập nhật' : '➕ Thêm sản phẩm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TÌM KIẾM */}
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput} 
            placeholder="🔍 Tìm kiếm sản phẩm..." 
            value={searchKeyword}
            onChangeText={handleSearch} 
          />
        </View>

        {/* DANH SÁCH SẢN PHẨM */}
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>📦 Danh sách sản phẩm ({products.length})</Text>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.gridContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
            }
            renderItem={({ item }) => (
              <ProductCard
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getImageSource={getImageSource}
              />
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
};

/* ==================== STYLES ==================== */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: {
    backgroundColor: '#FFD93D',
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0C93D',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#333333',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  imagePicker: {
    backgroundColor: 'rgba(199, 129, 190, 1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedImage: { 
    width: 100, 
    height: 100, 
    marginVertical: 10, 
    alignSelf: 'center', 
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: 'rgba(85, 121, 133, 1)',
  },
  cancelButton: {
    backgroundColor: '#999999',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  productsContainer: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  gridContainer: { 
    paddingVertical: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 200,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  image: { 
    width: 100, 
    height: 100, 
    borderRadius: 8, 
    marginBottom: 8, 
    resizeMode: 'cover' 
  },
  infoContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 4,
    width: '100%',
  },
  productName: { 
    fontWeight: 'bold', 
    fontSize: 14, 
    textAlign: 'center', 
    lineHeight: 20, 
    color: '#333333',
    marginBottom: 5,
  },
  productPrice: { 
    color: '#E63946', 
    fontWeight: 'bold', 
    fontSize: 14,
  },
  iconRow: { 
    flexDirection: 'row', 
    marginTop: 8,
    justifyContent: 'center',
  },
  iconButton: { 
    marginHorizontal: 8,
    padding: 5,
  },
  icon: { 
    fontSize: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999999',
  },
});

export default ProductManagementScreen;

