import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { loginUser } from '../database';
import { useAuth } from './AuthContext';
import { BottomTabParamList } from './AppTabs';
import { HomeStackParamList } from './types';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'; // Thêm icons

type LoginScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<BottomTabParamList, 'LoginTab'>,
    NativeStackNavigationProp<HomeStackParamList>
>;

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const { login } = useAuth();

    const handleLogin = async () => {
        // Validation (Giữ Logic)
        if (!username.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập');
            return;
        }

        if (!password.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
            return;
        }

        try {
            setLoading(true);
            const user = await loginUser(username.trim(), password.trim());

            if (user) {
                login(user); // Lưu thông tin user vào context (Giữ Logic)
                Alert.alert('Thành công', `Đăng nhập thành công!\nXin chào ${user.username}`, [
                    {
                        text: 'OK',
                        onPress: () => {
                            setUsername('');
                            setPassword('');
                            // Điều hướng theo role (Giữ Logic)
                            if (user.role === 'admin') {
                                navigation.navigate('AdminHomeTab');
                            } else {
                                navigation.navigate('HomeTab');
                            }
                        }
                    }
                ]);
            } else {
                Alert.alert('Lỗi', 'Tên đăng nhập hoặc mật khẩu không đúng');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>

                    <MaterialCommunityIcons name="lock-open-outline" size={80} color="#BB86FC" style={styles.icon} />
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Đăng nhập để tiếp tục khám phá</Text>

                    <View style={styles.card}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Tên đăng nhập</Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="user" size={20} color="#B3B3B3" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên đăng nhập"
                                    placeholderTextColor="#B3B3B3"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Mật khẩu</Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="lock" size={20} color="#B3B3B3" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mật khẩu"
                                    placeholderTextColor="#B3B3B3"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#121212" /> : <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('SignupTab')} style={styles.signupLink}>
                            <Text style={styles.signupText}>Chưa có tài khoản? <Text style={styles.linkHighlight}>Đăng ký ngay</Text></Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#121212", // Nền Tối
    },
    scrollContent: {
        flexGrow: 1,
        padding: 30,
        justifyContent: "center",
    },
    container: {
        width: "100%",
        alignItems: 'center',
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: "#B3B3B3",
        textAlign: "center",
        marginBottom: 30,
    },
    card: {
        backgroundColor: "#1E1E1E", // Card nền tối
        padding: 25,
        borderRadius: 16,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#333333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#2C2C2C", // Input nền tối hơn
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#333333',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#FFFFFF',
    },
    button: {
        marginTop: 20,
        backgroundColor: "#BB86FC", // Nút chính màu Tím
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#121212", // Chữ tối trên nền tím
        fontSize: 18,
        fontWeight: "bold",
    },
    signupLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    signupText: {
        color: '#B3B3B3',
        fontSize: 15,
    },
    linkHighlight: {
        color: '#03DAC6', // Màu Teal cho link
        fontWeight: 'bold',
    }
});

export default LoginScreen;