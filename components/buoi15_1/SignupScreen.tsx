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
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { addUser } from '../database';
import { BottomTabParamList } from './AppTabs';
import { Ionicons, Feather } from '@expo/vector-icons'; // Thêm icons

type SignupScreenNavigationProp = BottomTabNavigationProp<BottomTabParamList, 'SignupTab'>;

const SignupScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<SignupScreenNavigationProp>();

    const handleSignup = async () => {
        // Validation (Giữ Logic)
        if (!username.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập');
            return;
        }

        if (!password.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setLoading(true);
            await addUser(username.trim(), password.trim(), 'user'); // Giữ Logic
            Alert.alert('Thành công', 'Đăng ký thành công!', [
                {
                    text: 'OK',
                    onPress: () => {
                        setUsername('');
                        setPassword('');
                        setConfirmPassword('');
                        // Điều hướng đến LoginTab để đăng nhập (Giữ Logic)
                        navigation.navigate('LoginTab');
                    }
                }
            ]);
        } catch (error: any) {
            if (error.message?.includes('UNIQUE constraint')) {
                Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại');
            } else {
                Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    // --- LAYOUT MỚI CHO SIGNUP SCREEN ---
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>

                    <Ionicons name="person-add-outline" size={80} color="#03DAC6" style={styles.icon} />
                    <Text style={styles.title}>Tạo Tài Khoản</Text>
                    <Text style={styles.subtitle}>Đăng ký nhanh chóng và dễ dàng</Text>

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
                                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                    placeholderTextColor="#B3B3B3"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Xác nhận mật khẩu</Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="lock" size={20} color="#B3B3B3" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập lại mật khẩu"
                                    placeholderTextColor="#B3B3B3"
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#121212" /> : <Text style={styles.buttonText}>ĐĂNG KÝ</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('LoginTab')} style={styles.loginLink}>
                            <Text style={styles.loginText}>Đã có tài khoản? <Text style={styles.linkHighlight}>Đăng nhập</Text></Text>
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
        backgroundColor: "#121212",
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
        backgroundColor: "#1E1E1E",
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
        backgroundColor: "#2C2C2C",
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
        backgroundColor: "#03DAC6", // Nút đăng ký màu Teal
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#121212",
        fontSize: 18,
        fontWeight: "bold",
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        color: '#B3B3B3',
        fontSize: 15,
    },
    linkHighlight: {
        color: '#BB86FC', // Màu Tím cho link
        fontWeight: 'bold',
    }
});

export default SignupScreen;