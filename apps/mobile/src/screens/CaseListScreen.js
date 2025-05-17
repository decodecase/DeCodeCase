import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView } from 'react-native';

// Placeholder for CaseListScreen
export default function CaseListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Available Cases</Text>
      <Button
        title="Dead Air (Mock)"
        onPress={() => navigation.navigate('InvestigationDashboard', { caseId: 'dead-air-mock' })}
      />
      {/* Later, this will be a list of cases */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
}); 