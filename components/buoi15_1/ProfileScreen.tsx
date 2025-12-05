import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
    Image,
    Dimensions,
} from "react-native";
import { useAuth } from "./AuthContext";
import { Feather, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn muốn đăng xuất khỏi tài khoản?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất",
                style: "destructive",
                onPress: logout,
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            
            {/* Custom Header with Back Button */}
            <View style={styles.appHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.appHeaderTitle}>Hồ Sơ Của Tôi</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* USER INFO CARD */}
                <View style={styles.userInfoCard}>
                    
                    {/* Avatar & Edit */}
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={() => navigation.navigate("EditProfile")}
                    >
                        <View style={styles.avatar}>
                        {user.avatar ? (
                            <Image
                                source={{ uri: user.avatar }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={styles.avatarText}>
                                {user.username.charAt(0).toUpperCase()}
                            </Text>
                        )}
                        </View>

                        <View style={styles.editIcon}>
                            <Feather name="edit-2" size={16} color="#121212" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.username}>{user.username}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                            {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                        </Text>
                    </View>
                </View>

                {/* MENU SECTION */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Tài khoản & Hoạt động</Text>
                    
                    {/* Đơn hàng */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate("MyOrders")}
                    >
                        <Feather name="shopping-bag" size={22} color="#03DAC6" />
                        <Text style={styles.menuText}>Đơn hàng của tôi</Text>
                        <Feather name="chevron-right" size={22} color="#B3B3B3" />
                    </TouchableOpacity>

                    {/* Đổi mật khẩu */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate("ChangePassword")}
                    >
                        <Feather name="lock" size={22} color="#BB86FC" />
                        <Text style={styles.menuText}>Đổi mật khẩu</Text>
                        <Feather name="chevron-right" size={22} color="#B3B3B3" />
                    </TouchableOpacity>

                    {/* Chỉnh sửa thông tin */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate("EditProfile")}
                    >
                        <Feather name="user" size={22} color="#BB86FC" />
                        <Text style={styles.menuText}>Chỉnh sửa thông tin cá nhân</Text>
                        <Feather name="chevron-right" size={22} color="#B3B3B3" />
                    </TouchableOpacity>
                </View>

                {/* LOGOUT BUTTON */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Feather name="log-out" size={20} color="#CF6679" />
                    <Text style={styles.logoutText}>ĐĂNG XUẤT</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212", // Nền Tối
    },
    
    // --- APP HEADER ---
    appHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appHeaderTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: -40, // Căn giữa
    },

    scrollContent: {
        padding: 20,
    },

    // --- USER INFO CARD ---
    userInfoCard: {
        backgroundColor: '#1E1E1E',
        padding: 30,
        borderRadius: 16,
        marginBottom: 30,
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#333333',
    },
    
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#2C2C2C",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: '#BB86FC',
    },
    avatarImage: { 
        width: 100, 
        height: 100, 
        borderRadius: 50 
    },
    editIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#03DAC6", // Teal cho icon chỉnh sửa
        borderRadius: 15,
        padding: 8,
        borderWidth: 2,
        borderColor: '#1E1E1E',
    },
    avatarText: {
        fontSize: 42,
        fontWeight: "bold",
        color: "#BB86FC",
    },
    username: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff",
        marginTop: 5,
    },
    roleBadge: {
        backgroundColor: '#333333',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        marginTop: 8,
    },
    roleText: {
        fontSize: 13,
        color: "#03DAC6",
        fontWeight: '600',
    },

    // --- MENU SECTION ---
    menuSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#B3B3B3",
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    card: {
        backgroundColor: '#1E1E1E', // Nền Card
        borderRadius: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#333333',
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 18, // Padding lớn hơn
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#2C2C2C", // Viền tối hơn
    },
    menuText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "600",
    },

    // --- LOGOUT BUTTON ---
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#CF6679', // Màu cảnh báo
        gap: 10,
    },
    logoutText: {
        color: "#CF6679",
        fontSize: 18,
        fontWeight: "bold",
    },
});