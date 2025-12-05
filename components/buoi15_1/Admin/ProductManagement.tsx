import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions, // Thêm Dimensions
  ScrollView, // Thêm ScrollView vào Modal
} from 'react-native';
import {
  addProduct,
  Category,
  deleteProduct,
  fetchCategories,
  fetchProductsByCategory,
  Product,
  updateProduct
} from '../../database';
import Header from '../Header';
import { HomeStackParamList } from '../types';
import { productImages } from "../../../src/utils/productImages";
import * as ImagePicker from 'expo-image-picker';

type ProductManagementProps = NativeStackScreenProps<HomeStackParamList, 'ProductManagement'>;

const { width } = Dimensions.get('window');
// Định nghĩa kích thước cho lưới 2 cột
const CARD_WIDTH = (width - 45) / 2; // (Tổng chiều rộng - padding ngoài 30 - khoảng cách giữa 15) / 2

const ProductManagement = ({ route, navigation }: ProductManagementProps) => {
  const { categoryId } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImg, setProductImg] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProductImg(result.assets[0].uri); // lưu URI ảnh
    }
  };


  useEffect(() => {
    loadData();
  }, [categoryId]);

  useEffect(() => {
    if (selectedCategoryId) {
      loadProducts();
    }
  }, [selectedCategoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catsData, prodsData] = await Promise.all([
        fetchCategories(),
        categoryId > 0 ? fetchProductsByCategory(categoryId) : Promise.resolve([])
      ]);
      setCategories(catsData as Category[]);
      setProducts(prodsData as Product[]); 
      setSelectedCategoryId(categoryId > 0 ? categoryId : (catsData[0]?.id || 0));
    } catch (error) {
      console.error('❌ Lỗi khi tải dữ liệu:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };


  const loadProducts = async () => {
    try {
      if (selectedCategoryId > 0) {
        const data = await fetchProductsByCategory(selectedCategoryId);
        setProducts(data as Product[]); 
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải sản phẩm:', error);
    }
  };


  const handleAdd = () => {
    setEditingProduct(null);
    setProductName('');
    setProductPrice('');
    setProductImg('');
    setModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductImg(product.img);
    setSelectedCategoryId(product.categoryId);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return;
    }

    if (!productPrice.trim() || isNaN(parseFloat(productPrice))) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ');
      return;
    }

    if (selectedCategoryId === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }

    try {
      const price = parseFloat(productPrice);
      if (editingProduct) {
        await updateProduct({
          id: editingProduct.id,
          name: productName.trim(),
          price,
          img: productImg.trim() || 'hinh1.jpg',
          categoryId: selectedCategoryId
        });
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm thành công');
      } else {
        await addProduct({
          name: productName.trim(),
          price,
          img: productImg.trim() || 'hinh1.jpg',
          categoryId: selectedCategoryId
        });
        Alert.alert('Thành công', 'Đã thêm sản phẩm thành công');
      }
      setModalVisible(false);
      resetForm();
      loadProducts();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Alert.alert('Thành công', 'Đã xóa sản phẩm thành công');
              loadProducts();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductName('');
    setProductPrice('');
    setProductImg('hinh1.jpg');
  };

  // Thay đổi renderProduct để phù hợp với Grid Layout
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageWrapper}>
        <Image
          source={
            item.img?.startsWith("file://") || item.img?.startsWith("asset://")
              ? { uri: item.img }
              : productImages[item.img] || require("../../../assets/images/hinh1.jpg")
          }
          style={styles.productImage}
        />
      </View>

      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>
          {item.price.toLocaleString('vi-VN')} đ
        </Text>
        <Text style={styles.productCategory}>
          {categories.find(c => c.id === item.categoryId)?.name || 'N/A'}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Feather name="edit" size={14} color="#121212" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Feather name="trash-2" size={14} color="#CF6679" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BB86FC" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản Lý Sản Phẩm</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Category Selector */}
      <View style={styles.categorySelector}>
        <TouchableOpacity
          style={styles.selectorHeader}
          onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          activeOpacity={0.7}
        >
          <Text style={styles.selectorLabel}>
            {categories.find(c => c.id === selectedCategoryId)?.name || 'Chọn Danh mục'}
          </Text>
          <Feather
            name={showCategoryDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color="#BB86FC"
          />
        </TouchableOpacity>

        {/* Drop-down content */}
        {showCategoryDropdown && (
          <View style={styles.dropdownContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.dropdownItem,
                  selectedCategoryId === cat.id && styles.dropdownItemActive
                ]}
                onPress={() => {
                  setSelectedCategoryId(cat.id);
                  setShowCategoryDropdown(false);
                  loadProducts(); // load sản phẩm sau khi chọn
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedCategoryId === cat.id && styles.dropdownItemTextActive
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>


      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2} // Sử dụng lưới 2 cột
        columnWrapperStyle={styles.columnWrapper} // Bố cục cột
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Chưa có sản phẩm nào trong danh mục này
            </Text>
          </View>
        }
      />

      {/* Modal Add/Edit Product */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}
            </Text>

            {/* Form Fields - Sử dụng ScrollView để đảm bảo hiển thị hết trên màn hình nhỏ */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalLabel}>Tên sản phẩm:</Text>
                <TextInput
                    style={styles.modalInput}
                    placeholder="Nhập tên sản phẩm"
                    value={productName}
                    onChangeText={setProductName}
                    placeholderTextColor="#B3B3B3"
                />

                <Text style={styles.modalLabel}>Giá:</Text>
                <TextInput
                    style={styles.modalInput}
                    placeholder="Nhập giá"
                    value={productPrice}
                    onChangeText={setProductPrice}
                    keyboardType="numeric"
                    placeholderTextColor="#B3B3B3"
                />

                <Text style={styles.modalLabel}>Hình ảnh:</Text>
                <View style={styles.imagePickerSection}>
                    {productImg ? (
                        <Image
                            source={{ uri: productImg }}
                            style={styles.modalImagePreview}
                        />
                    ) : (
                        <View style={styles.modalImagePlaceholder}>
                            <Text style={{ color: '#B3B3B3', fontSize: 12 }}>Không có ảnh</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.pickImageButton}
                        onPress={pickImage}
                    >
                        <Text style={styles.pickImageButtonText}>Chọn ảnh</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.modalLabel}>Danh mục:</Text>
                <View style={styles.categorySelect}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryOption,
                                selectedCategoryId === cat.id && styles.categoryOptionActive
                            ]}
                            onPress={() => setSelectedCategoryId(cat.id)}
                        >
                            <Text
                                style={[
                                    styles.categoryOptionText,
                                    selectedCategoryId === cat.id && styles.categoryOptionTextActive
                                ]}
                            >
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212' // Nền Tối
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E', // Header nền tối
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center'
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#BB86FC', // Màu Nhấn Tím
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    fontSize: 24,
    color: '#121212', // Chữ tối
    fontWeight: 'bold'
  },
  categorySelector: {
    backgroundColor: '#1E1E1E', // Selector nền tối
    padding: 10, // Giảm padding
    borderBottomWidth: 1,
    borderBottomColor: '#333333'
  },
  selectorLabel: {
    fontSize: 14, // Giảm font size
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8, // Giảm padding
    paddingHorizontal: 12,
    backgroundColor: '#2C2C2C', 
    borderRadius: 10,
  },

  dropdownContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    marginTop: 8, // Giảm margin
    paddingVertical: 5,
  },

  dropdownItem: {
    paddingVertical: 10, // Giảm padding
    paddingHorizontal: 15,
  },

  dropdownItemActive: {
    backgroundColor: '#BB86FC', 
    borderRadius: 6,
    marginHorizontal: 5
  },

  dropdownItemText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  dropdownItemTextActive: {
    color: '#121212', 
    fontWeight: '700',
  },

  // --- PRODUCT CARD (GRID LAYOUT) ---
  productCard: {
    width: CARD_WIDTH, // Sử dụng kích thước tính toán
    backgroundColor: '#1E1E1E', 
    borderRadius: 12, // Giảm bo góc
    padding: 8, // Giảm padding
    marginBottom: 0,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  productImageWrapper: {
    width: '100%',
    height: 100, // Kích thước cố định cho ảnh trong Grid
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: '#2C2C2C'
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
    minHeight: 45, // Giảm chiều cao tối thiểu
  },
  productName: {
    fontSize: 13, // Giảm font size
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  productPrice: {
    fontSize: 14, // Giảm font size
    color: '#03DAC6', 
    fontWeight: 'bold',
  },
  productCategory: {
    fontSize: 10, // Giảm font size
    color: '#B3B3B3',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8, // Giảm gap
    paddingTop: 8, // Giảm padding
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
  },
  actionButton: {
    padding: 6, // Giảm padding nút
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#BB86FC', 
    borderColor: '#BB86FC',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderColor: '#CF6679',
  },
  // Xóa style actionButtonText và deleteButtonText không dùng
  // actionButtonText: { color: '#121212' },
  // deleteButtonText: { color: '#CF6679' }, 

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#B3B3B3'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#B3B3B3'
  },

  // --- MODAL STYLES (Optimized) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12, // Giảm bo góc
    padding: 20, // Giảm padding
    width: '90%',
    maxHeight: '90%', // Chiều cao tối đa cao hơn
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20, // Giảm font size
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15, // Giảm margin
    textAlign: 'center'
  },
  modalLabel: {
    fontSize: 13, // Giảm font size
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4, // Giảm margin
    marginTop: 8
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10, // Giảm padding
    fontSize: 14, // Giảm font size
    backgroundColor: '#2C2C2C',
    marginBottom: 8, // Giảm margin
    color: '#FFFFFF'
  },
  imagePickerSection: {
    alignItems: 'center', 
    marginBottom: 10 
  },
  modalImagePreview: {
    width: 80, // Giảm kích thước ảnh
    height: 80, 
    borderRadius: 8,
    marginBottom: 8,
  },
  modalImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333'
  },
  pickImageButton: {
    backgroundColor: '#BB86FC',
    paddingHorizontal: 12,
    paddingVertical: 6, // Giảm padding
    borderRadius: 8
  },
  pickImageButtonText: {
    color: '#121212', 
    fontWeight: '600',
    fontSize: 13, // Giảm font size
  },
  categorySelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6, // Giảm gap
    marginBottom: 15
  },
  categoryOption: {
    paddingHorizontal: 10, 
    paddingVertical: 6, // Giảm padding
    borderRadius: 8,
    backgroundColor: '#2C2C2C',
    borderWidth: 1,
    borderColor: '#333333'
  },
  categoryOptionActive: {
    backgroundColor: '#BB86FC',
    borderColor: '#BB86FC'
  },
  categoryOptionText: {
    fontSize: 12, // Giảm font size
    color: '#FFFFFF'
  },
  categoryOptionTextActive: {
    color: '#121212',
    fontWeight: 'bold'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12, 
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10, // Giảm padding
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4 // Giảm margin
  },
  cancelButton: {
    backgroundColor: '#333333',
    borderWidth: 0,
  },
  cancelButtonText: {
    fontSize: 15, // Giảm font size
    fontWeight: '600',
    color: '#B3B3B3'
  },
  saveButton: {
    backgroundColor: '#BB86FC'
  },
  saveButtonText: {
    fontSize: 15, // Giảm font size
    fontWeight: '600',
    color: '#121212'
  }
});

export default ProductManagement;