import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { NativeStackScreenProps, NativeStackNavigationProp  } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from './types';
import { addToCart } from '../database';
import { useAuth } from './AuthContext';
import { Ionicons, Feather } from '@expo/vector-icons'; 

type DetailsScreenProps = NativeStackScreenProps<HomeStackParamList, 'Details'>;

const DetailsScreen = ({ route }: DetailsScreenProps) => {
  const { product } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert("🚫 Chưa đăng nhập", "Bạn cần đăng nhập để thêm vào giỏ hàng.");
      navigation.getParent()?.navigate("LoginTab");
      return;
    }

    // Giữ Logic code gốc
    await addToCart({
      id: Number(product.id),
      name: product.name,
      price: Number(product.price.replace(/[^\d]/g, "")),
      img: product.img,
      categoryId: 0,
    });

    Alert.alert("🎉 Thành công", "Đã thêm vào giỏ hàng!");
  };

  const handleBuyNow = async () => {
    if (!user) {
      Alert.alert("🚫 Chưa đăng nhập", "Bạn cần đăng nhập để mua hàng.");
      navigation.getParent()?.navigate("LoginTab");
      return;
    }
    // Giữ Logic code gốc
    await handleAddToCart();
    navigation.navigate("Cart");
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* IMAGE & HEADER */}
        <View style={styles.imageHeaderWrapper}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle" size={36} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={product.image} style={styles.productImage} />
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Feather name="heart" size={24} color="#CF6679" />
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô Tả Sản Phẩm</Text>
            <Text style={styles.descriptionText}>
              Sản phẩm chất lượng cao, được chọn lọc kỹ càng.
              Đảm bảo chất lượng và uy tín. Giao hàng nhanh chóng,
              đóng gói cẩn thận.
            </Text>
          </View>
          
          {/* Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Thông Số Chi Tiết</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã sản phẩm</Text>
              <Text style={styles.detailValue}>#{product.id}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tên sản phẩm</Text>
              <Text style={styles.detailValue}>{product.name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giá bán</Text>
              <Text style={styles.detailValue}>{product.price}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar (Cố định) */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleAddToCart}
        >
          <Feather name="plus-circle" size={20} color="#121212" style={{ marginRight: 8 }} />
          <Text style={styles.cartButtonText}>Thêm Giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyButtonText}>Mua Ngay</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212', // Nền Tối
  },

  /* IMAGE & HEADER */
  imageHeaderWrapper: {
    width: '100%',
    height: 400,
    backgroundColor: '#2C2C2C',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 2,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  /* INFO AREA */
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: -30, // Kéo lên
    backgroundColor: '#121212',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  productName: {
    fontSize: 32, // Lớn hơn
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },

  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  productPrice: {
    fontSize: 30, // Lớn hơn
    fontWeight: 'bold',
    color: '#03DAC6', // Màu Teal
  },
  
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 20,
  },

  /* SECTIONS */
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BB86FC', // Màu Nhấn Tím
    marginBottom: 15,
  },

  // Description
  descriptionSection: {
    marginBottom: 25,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 25,
    color: '#B3B3B3',
    textAlign: 'justify',
  },

  // Details
  detailsSection: {
    backgroundColor: '#1E1E1E', // Nền tối hơn
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#333333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  detailLabel: {
    fontSize: 15,
    color: '#B3B3B3',
    flex: 1,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* ACTION BAR */
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    gap: 15,
    borderTopWidth: 1,
    borderColor: '#333333',
  },

  buyButton: {
    flex: 1,
    backgroundColor: '#BB86FC', // Mua Ngay màu tím
    paddingVertical: 18, // Padding lớn
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: '700',
  },

  cartButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#03DAC6', // Thêm giỏ màu Teal
    paddingVertical: 18,
    borderRadius: 12,
  },
  cartButtonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: '700',
  },
});


export default DetailsScreen;