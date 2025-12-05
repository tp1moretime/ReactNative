import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Category } from '../database';

type CategorySelectorProps = {
  categories: Category[];
  selectedId: number;
  onSelect: (id: number) => void;
};

const CategorySelector = ({ categories, selectedId, onSelect }: CategorySelectorProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!categories || categories.length === 0) return null;

  const currentCategory = categories.find(c => c.id === selectedId)?.name || 'Chọn danh mục';

  return (
    <View style={styles.wrapper}>
      {/* Toggle Section */}
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.6}
      >
        <Text style={styles.headerText}>{currentCategory}</Text>
        <Feather 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#BB86FC" // Màu nhấn
        />
      </TouchableOpacity>

      {/* Dropdown Content */}
      {expanded && (
        <View style={styles.dropdown}>
          <ScrollView 
            style={{ maxHeight: 200 }} 
            showsVerticalScrollIndicator={false}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.button,
                  selectedId === category.id && styles.buttonSelected,
                ]}
                onPress={() => {
                  onSelect(category.id);
                  setExpanded(false);
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    selectedId === category.id && styles.buttonTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#1E1E1E', // Nền tối
    margin: 12,
    borderRadius: 16, // Bo góc lớn
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },

  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BB86FC', // Màu nhấn
  },

  dropdown: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#2C2C2C', // Nền nút tối
    borderWidth: 1,
    borderColor: '#333333',
  },

  buttonSelected: {
    backgroundColor: '#BB86FC', // Nền chọn Màu nhấn
    borderColor: '#BB86FC',
  },

  buttonText: {
    fontSize: 15,
    color: '#FFFFFF', // Chữ trắng
    fontWeight: '500',
  },

  buttonTextSelected: {
    color: '#121212', // Chữ tối trên nền sáng
    fontWeight: '700',
  },
});

export default CategorySelector;