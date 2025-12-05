import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView, // Thêm SafeAreaView
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons, Feather } from '@expo/vector-icons'; // Thêm icons

import { HomeStackParamList, Product1 } from "./types";
import { productImages } from "../../src/utils/productImages";
import {
    Product,
    Category,
    fetchCategories,
    fetchProductsByCategory,
} from "../database";

import CategorySelector from "./CategorySelector"; // Đã được chỉnh sửa Dark Mode

type ProductsByCategoryRouteProp = RouteProp<
    HomeStackParamList,
    "ProductsByCategory"
>;
type ProductsByCategoryNavigationProp = NativeStackNavigationProp<
    HomeStackParamList,
    "ProductsByCategory"
>;

// ===============================
// 🔥 CHUẨN HOÁ Product (DB) → Product1 (UI)
// ===============================
const convertToProduct1 = (p: Product): Product1 => ({
    id: p.id.toString(),
    name: p.name,
    price: p.price.toLocaleString("vi-VN") + "đ",
    img: p.img, 
    image: productImages[p.img], 
});

export default function ProductsByCategoryScreen() {
    const route = useRoute<ProductsByCategoryRouteProp>();
    const navigation = useNavigation<ProductsByCategoryNavigationProp>();
    const { categoryId } = route.params;

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            const data = await fetchCategories();
            setCategories(data);
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            const data = await fetchProductsByCategory(selectedCategoryId);
            setProducts(data as Product[]);
            setLoading(false);
        };
        loadProducts();
    }, [selectedCategoryId]);

    // Lấy tên danh mục hiện tại để hiển thị
    const currentCategoryName = categories.find(c => c.id === selectedCategoryId)?.name || 'Sản phẩm';

    // Render Product Item (Card 2 cột mới)
    const renderProductItem = ({ item }: { item: Product }) => {
        const p1 = convertToProduct1(item);

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() =>
                    navigation.navigate("Details", {
                        product: {
                            id: item.id.toString(),
                            name: item.name,
                            price: item.price.toLocaleString("vi-VN") + "đ",
                            img: item.img, 
                            image: productImages[item.img], 
                        },
                    })
                }
            >
                <Image
                    source={
                        item.img?.startsWith("file://") || item.img?.startsWith("content://")
                            ? { uri: item.img }
                            : productImages[item.img] || require("../../assets/images/hinh1.jpg")
                    }
                    style={styles.image}
                />

                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>{p1.name}</Text>
                    <Text style={styles.price}>{p1.price}</Text>
                    
                    <View style={styles.buyNowBtn}>
                        <Feather name="shopping-bag" size={16} color="#121212" />
                        <Text style={styles.buyNowText}>Mua</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };


    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{currentCategoryName}</Text>
                <View style={styles.backButton} />
            </View>

            {/* CATEGORY SELECTOR - Đặt dưới Header */}
            <CategorySelector
                categories={categories}
                selectedId={selectedCategoryId}
                onSelect={(id) => setSelectedCategoryId(id)}
            />

            {/* PRODUCTS LIST */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#BB86FC" />
                    <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
            ) : products.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.emptyText}>Không có sản phẩm nào trong danh mục này.</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    numColumns={2} // Chuyển sang lưới 2 cột
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    renderItem={renderProductItem}
                    columnWrapperStyle={styles.columnWrapper}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212" }, // Nền Tối

    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E1E1E", // Header nền tối
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    backButton: { width: 40, justifyContent: "center", alignItems: "center" },
    
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        flex: 1,
        textAlign: "center",
    },

    listContainer: { padding: 15, paddingBottom: 50 },
    columnWrapper: { justifyContent: 'space-between', marginBottom: 15 }, // Khoảng cách giữa các cột

    productCard: {
        width: '48%', // Chiếm 48% để chừa khoảng cách 
        padding: 12,
        backgroundColor: "#1E1E1E",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333333',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },

    image: { 
        width: '100%', 
        height: 150, 
        borderRadius: 12,
        resizeMode: 'cover',
        marginBottom: 10,
        backgroundColor: '#2C2C2C',
    },

    info: { flex: 1, alignItems: 'flex-start' },

    name: { 
        fontWeight: "600", 
        fontSize: 16, 
        color: "#FFFFFF", 
        marginBottom: 5,
    },

    price: { 
        fontSize: 18, 
        color: "#03DAC6", // Màu Teal
        fontWeight: "bold", 
        marginTop: 4,
    },
    
    buyNowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#BB86FC', // Màu Nhấn Tím
        paddingVertical: 8,
        borderRadius: 10,
        width: '100%',
        marginTop: 10,
        gap: 8,
    },
    buyNowText: {
        color: "#121212",
        fontWeight: "700",
        fontSize: 15,
    },

    loadingContainer: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center",
        paddingTop: 50,
    },
    loadingText: {
        color: '#B3B3B3',
        marginTop: 10,
        fontSize: 15,
    },
    emptyText: {
        color: '#B3B3B3',
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
    }
});