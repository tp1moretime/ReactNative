import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ViewStyle, TextStyle, ImageStyle } from 'react-native';

const SHOE_URL =
    'data:image/jpeg;base64,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';

// Define products array with proper typing
const PRODUCTS: Product[] = Array.from({ length: 9 }).map((_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: `${(i + 1) * 50}.000đ`,
    // use a placeholder image — you can replace these URLs with your own
    image: SHOE_URL,
}));

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
}

export function LayoutHomework() {
  const handleBuy = (p: Product) => {
    // small demo handler — replace with navigation / add-to-cart
    Alert.alert('Buy', `Bạn đã chọn: ${p.name}`);
  };    return (
        <View style={styles.container}>
            {/* Explicit 3 rows so each row fills 1/3 of screen height */}
            <View style={styles.row}>
                {PRODUCTS.slice(0, 3).map((p) => (
                    <View key={p.id} style={styles.card}>
                        <View style={styles.cardInner}>
                            <Image source={{ uri: p.image }} style={styles.image} />
                            <View style={styles.meta}>
                                <Text style={styles.name} numberOfLines={1}>
                                    {p.name}
                                </Text>
                                <Text style={styles.price}>{p.price}</Text>
                                <TouchableOpacity style={styles.button} onPress={() => handleBuy(p)}>
                                    <Text style={styles.buttonText}>Buy now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.row}>
                {PRODUCTS.slice(3, 6).map((p) => (
                    <View key={p.id} style={styles.card}>
                        <View style={styles.cardInner}>
                            <Image source={{ uri: p.image }} style={styles.image} />
                            <View style={styles.meta}>
                                <Text style={styles.name} numberOfLines={1}>
                                    {p.name}
                                </Text>
                                <Text style={styles.price}>{p.price}</Text>
                                <TouchableOpacity style={styles.button} onPress={() => handleBuy(p)}>
                                    <Text style={styles.buttonText}>Buy now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.row}>
                {PRODUCTS.slice(6, 9).map((p) => (
                    <View key={p.id} style={styles.card}>
                        <View style={styles.cardInner}>
                            <Image source={{ uri: p.image }} style={styles.image} />
                            <View style={styles.meta}>
                                <Text style={styles.name} numberOfLines={1}>
                                    {p.name}
                                </Text>
                                <Text style={styles.price}>{p.price}</Text>
                                <TouchableOpacity style={styles.button} onPress={() => handleBuy(p)}>
                                    <Text style={styles.buttonText}>Buy now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

type Styles = {
  container: ViewStyle;
  row: ViewStyle;
  card: ViewStyle;
  cardInner: ViewStyle;
  meta: ViewStyle;
  image: ImageStyle;
  name: TextStyle;
  price: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f3f3f3',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  card: {
    flex: 1,
    padding: 6,
  },
  cardInner: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#e6e6e6',
    // shadow (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    // elevation (Android)
    elevation: 3,
    justifyContent: 'space-between',
  },
  image: {
    width: '100%',
    height: '52%',
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  meta: {
    width: '100%',
    alignItems: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  price: {
    fontSize: 13,
    color: '#444',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'stretch',
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
}) as const; // Add type assertion to fix style property errors