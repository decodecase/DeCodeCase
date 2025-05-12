import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const CheckoutScreen = ({ route, navigation }) => {
  const { caseId, caseTitle, price } = route.params; // Assuming these are passed from CaseDetailScreen

  // Placeholder for actual payment integration
  const handlePlaceOrder = () => {
    console.log('Placing order for:', caseTitle, 'Price:', price);
    // After successful payment, navigate to game or update case status
    alert('Order Placed! (Placeholder)');
    // Potentially navigate to Home or mark the case as owned and navigate to CaseDetail or GamePlay
    navigation.popToTop(); // Go back to the top of the stack (e.g., HomeScreen)
  };

  // Dummy data for checkout items
  const items = [
    { id: caseId, name: caseTitle, description: 'Quantity: 01', price: parseFloat(price.replace('$', '')) },
  ];
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const taxes = subtotal * 0.1; // Example 10% tax
  const total = subtotal + taxes;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <TouchableOpacity style={styles.optionRow} onPress={() => alert('Select Payment Method')}>
          <Text style={styles.optionText}>Visa *1234</Text>
          <Text style={styles.optionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promos</Text>
        <TouchableOpacity style={styles.optionRow} onPress={() => alert('Apply Promo Code')}>
          <Text style={styles.optionText}>Apply promo code</Text>
          <Text style={styles.optionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {items.map(item => (
          <View key={item.id} style={styles.itemRow}>
            {/* Add item image thumbnail here */}
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Subtotal ({items.length})</Text>
          <Text style={styles.summaryText}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Taxes</Text>
          <Text style={styles.summaryText}>${taxes.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
        <Text style={styles.placeOrderButtonText}>Place order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 30,
    color: '#333',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 10,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor:'#f8f9fa', // Light gray for section title background
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  optionText: {
    fontSize: 16,
  },
  optionArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  itemDetails: {
      flex: 1,
      marginLeft: 10, // If there was an image thumbnail
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summarySection: {
    backgroundColor: '#ffffff',
    marginTop: 10,
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    marginTop:5
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeOrderButton: {
    backgroundColor: '#28a745', // Green color for place order
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 15,
  },
  placeOrderButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen; 