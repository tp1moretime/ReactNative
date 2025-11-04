
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import ContactItem from "../components/contactItem";


const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const ContactScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");

  // validation errors
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // edit mode
  const [editingId, setEditingId] = useState(null);

  const validate = () => {
    let ok = true;
    const n = name.trim();
    const p = phone.trim();

    if (!n) {
      setNameError("Vui lòng nhập tên.");
      ok = false;
    } else {
      setNameError("");
    }

    if (!p) {
      setPhoneError("Vui lòng nhập số điện thoại.");
      ok = false;
    } else if (!PHONE_REGEX.test(p)) {
      setPhoneError("Số điện thoại không đúng định dạng.");
      ok = false;
    } else {
      setPhoneError("");
    }

    return ok;
  };

  const onSave = () => {
    if (!validate()) {
      // show an alert to catch attention (optional)
      Alert.alert("Lỗi", "Vui lòng kiểm tra lại thông tin trước khi lưu.");
      return;
    }

    const newContact = { id: Date.now().toString(), name: name.trim(), phone: phone.trim() };

    if (editingId) {
      // cập nhật contact
      setContacts((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, name: newContact.name, phone: newContact.phone } : c))
      );
      // thông báo thành công
      Alert.alert("Thành công", "Đã cập nhật liên hệ.");
    } else {
      // thêm mới
      setContacts((prev) => [newContact, ...prev]);
      Alert.alert("Thành công", "Đã thêm liên hệ.");
    }

    // reset form và trạng thái edit
    setName("");
    setPhone("");
    setEditingId(null);
    setNameError("");
    setPhoneError("");
  };

  const deleteContact = (contact) => {
    Alert.alert("Xác nhận", `Bạn có chắc muốn xóa ${contact.name}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => setContacts((prev) => prev.filter((c) => c.id !== contact.id)),
      },
    ]);
  };

  const editContact = (contact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setEditingId(contact.id);
    setNameError("");
    setPhoneError("");
  };

  const cancelEdit = () => {
    setName("");
    setPhone("");
    setEditingId(null);
    setNameError("");
    setPhoneError("");
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DANH BẠ</Text>

      <TextInput
        placeholder="Tên"
        value={name}
        onChangeText={(t) => {
          setName(t);
          if (t.trim()) setNameError("");
        }}
        style={[styles.input, nameError ? styles.inputError : null]}
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

      <TextInput
        placeholder="Số điện thoại"
        value={phone}
        onChangeText={(t) => {
          setPhone(t);
          if (PHONE_REGEX.test(t.trim())) setPhoneError("");
        }}
        keyboardType="phone-pad"
        style={[styles.input, phoneError ? styles.inputError : null]}
      />
      {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

      <TouchableOpacity style={styles.addBtn} onPress={onSave}>
        <Text style={styles.addText}>{editingId ? "CHỈNH SỬA" : "THÊM"}</Text>
      </TouchableOpacity>

      {editingId ? (
        <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
          <Text style={styles.cancelText}>HỦY CHỈNH SỬA</Text>
        </TouchableOpacity>
      ) : null}

      <TextInput
        placeholder="Tìm kiếm..."
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactItem contact={item} onEdit={editContact} onDelete={deleteContact} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Không có liên hệ nào.</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fdf0f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#d63031",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  addBtn: {
    backgroundColor: "#b71540",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  addText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelBtn: {
    backgroundColor: "#cccccc",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    color: "#e74c3c",
    marginBottom: 6,
    marginLeft: 6,
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#666",
  },
});

export default ContactScreen;