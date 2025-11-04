

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';


interface Contact {
  id: string;
  name: string;
  phone: string;
}

const PRIMARY_COLOR = '#E91E63';
const LIGHT_PINK_BACKGROUND = '#FCE4EC';
const TEXT_INPUT_BACKGROUND = 'white';


const initialContacts: Contact[] = [];


const generateId = (): string => Date.now().toString();


const ContactListScreen: React.FC = () => {

  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');


  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddOrUpdateContact = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Tên và Số điện thoại.');
      return;
    }

    if (!/^\d+$/.test(phone.trim())) {
      Alert.alert('Lỗi', 'Số điện thoại chỉ được chứa chữ số.');
      return;
    }

    if (editingId) {

      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === editingId
            ? { ...contact, name: name.trim(), phone: phone.trim() }
            : contact
        )
      );
      setEditingId(null);
      Alert.alert('Thành công', 'Đã cập nhật liên hệ thành công.');
    } else {

      const newContact: Contact = {
        id: generateId(),
        name: name.trim(),
        phone: phone.trim(),
      };
      setContacts(prevContacts => [...prevContacts, newContact]);
      Alert.alert('Thành công', 'Đã thêm liên hệ mới thành công.');
    }


    setName('');
    setPhone('');
  };

  const handleEditContact = (contact: Contact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setEditingId(contact.id);
  };


  const performDelete = (id: string) => {
    setContacts(prevContacts => prevContacts.filter(contact => contact.id !== id));

    if (editingId === id) {
      setName('');
      setPhone('');
      setEditingId(null);
    }

    Alert.alert('Thành công', 'Đã xóa liên hệ.');
  };


  const handleDeleteContact = (id: string) => {

    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
        performDelete(id);
      }
    } else {
      Alert.alert(
        'Xác nhận Xóa',
        'Bạn có chắc chắn muốn xóa liên hệ này?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            onPress: () => performDelete(id),
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) {
      return contacts;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [contacts, searchTerm]);


  const ContactItem: React.FC<{ contact: Contact }> = ({ contact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>

        <Text style={styles.chatIcon}>💬</Text>
        <View>

          <Text style={styles.contactName}>{contact.name}</Text>

          <Text style={styles.contactPhone}>{contact.phone}</Text>
        </View>
      </View>

      <View style={styles.contactActions}>

        <TouchableOpacity
          onPress={() => handleEditContact(contact)}
          style={styles.actionButton}
        >

          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteContact(contact.id)}
          style={styles.actionButton}
        >

          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <Text style={styles.title}>DANH BẠ</Text>


        <TextInput
          style={[styles.input, styles.pinkBorder]}
          placeholder="Tên"
          value={name}
          onChangeText={setName}
          placeholderTextColor={PRIMARY_COLOR}
        />

        <TextInput
          style={[styles.input, styles.pinkBorder]}
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          keyboardType="numeric"
          placeholderTextColor={PRIMARY_COLOR}
        />

        <TouchableOpacity
          style={[styles.addButton, styles.shadowDarkPink]}
          onPress={handleAddOrUpdateContact}
        >
          <Text style={styles.addButtonText}>
            {editingId ? 'CẬP NHẬT' : 'THÊM'}
          </Text>
        </TouchableOpacity>


        <TextInput
          style={[styles.searchInput, styles.pinkBorder]}
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#999"
        />


        <FlatList
          data={filteredContacts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ContactItem contact={item} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có liên hệ nào được tìm thấy.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 20,
  },

  pinkBorder: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
  },

  input: {
    height: 50,
    backgroundColor: TEXT_INPUT_BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  searchInput: {
    height: 50,
    backgroundColor: TEXT_INPUT_BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,

    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },

  shadowDarkPink: {
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,

  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: LIGHT_PINK_BACKGROUND,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatIcon: {
    fontSize: 20,
    marginRight: 15,
    color: PRIMARY_COLOR,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
  },
  editIcon: {
    fontSize: 20,
    color: '#FFC107',
  },
  deleteIcon: {
    fontSize: 20,
    color: PRIMARY_COLOR,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});

export default ContactListScreen;
