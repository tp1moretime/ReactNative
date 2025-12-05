import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Category, fetchCategories, initDatabase } from "../database";
import { HomeStackParamList } from "./types";

type Props = NativeStackScreenProps<HomeStackParamList, "Categories">;

// --- DỮ LIỆU GIẢ ĐỊNH CHO ẢNH DANH MỤC ---
// Bạn cần thay thế các require này bằng đường dẫn thực tế đến ảnh của bạn
const categoryImages: Record<number, any> = {
    1: require('../../assets/images/hinh1.jpg'), 
    2: require('../../assets/images/hinh1.jpg'), 
    3: require('../../assets/images/hinh1.jpg'), 
    4: require('../../assets/images/hinh1.jpg'), 
    5: require('../../assets/images/hinh1.jpg'), 
    // Thêm các ID và ảnh tương ứng khác nếu cần
};
// ----------------------------------------

const CategoriesScreen = ({ navigation }: Props) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                await initDatabase(); 
                const data = await fetchCategories(); 
                setCategories(data); 
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            } finally {
                setLoading(false);
            }
        };
        load(); 
    }, []);

    const handlePress = (id: number) => {
        navigation.navigate("ProductsByCategory", { categoryId: id });
    };

    const renderItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={styles.gridItem}
            onPress={() => handlePress(item.id)}
            activeOpacity={0.8}
        >
            {/* Thay thế iconBox bằng Image */}
            <Text style={styles.catName} numberOfLines={2}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#BB86FC" />
                <Text style={{ marginTop: 10, color: "#B3B3B3" }}>Đang tải danh mục...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Khám Phá Danh Mục</Text>

                <View style={{ width: 40 }} />
            </View>

            {/* CATEGORY GRID */}
            <FlatList
                data={categories}
                numColumns={2} 
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.grid}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212" }, // Nền Tối

    header: {
        backgroundColor: "#1E1E1E",
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },

    backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
    backIcon: { color: "#fff", fontSize: 26, fontWeight: "bold" },

    headerTitle: {
        flex: 1,
        textAlign: "center",
        color: "#FFFFFF",
        fontSize: 22, 
        fontWeight: "700",
    },

    grid: {
        padding: 15,
        paddingBottom: 50,
    },

    gridItem: {
        flex: 1,
        maxWidth: "48%", 
        margin: '1%',
        marginBottom: 15,
        alignItems: "center",
        backgroundColor: '#1E1E1E',
        borderRadius: 16, 
        padding: 15, // Giảm padding card
        borderWidth: 1,
        borderColor: '#333333',
    },

    // Thay đổi từ iconBox sang imageBox
    imageBox: {
        width: '100%', // Ảnh chiếm toàn bộ chiều rộng card
        height: 120, // Kích thước cố định cho ảnh
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: "#2C2C2C", 
        justifyContent: "center",
        alignItems: "center",
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // Đảm bảo ảnh vừa khung
    },

    catName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF", 
        textAlign: "center",
        marginTop: 5, // Giảm margin top
    },

    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
    },
});

export default CategoriesScreen;