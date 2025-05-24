import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';

// Import metadata for available cases
// In a real app, this might come from a central registry or be dynamically loaded
import deadAirMetadata from '../../../../packages/case-bundles/dead-air/metadata.json';
// import fadingMindsMetadata from '../../../../packages/case-bundles/fading-minds/metadata.json'; // Example for another case

const caseRegistry = [
  { id: 'dead-air', metadata: deadAirMetadata, coverImage: require('../../../../packages/case-bundles/dead-air/assets/images/deadair.png') }, // Corrected path and filename
  // { id: 'fading-minds', metadata: fadingMindsMetadata, coverImage: require('../../../../packages/case-bundles/fading-minds/assets/images/cover.png') },
];

export default function CaseListScreen({ navigation }) {
  const renderCaseItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.caseItem}
      onPress={() => navigation.navigate('CaseDetailScreen', { caseId: item.id })}
    >
      {item.coverImage ? (
        <Image source={item.coverImage} style={styles.caseImage} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholderContainer}>
          <Text style={styles.imagePlaceholderText}>{item.metadata.title.substring(0,1)}</Text>
        </View>
      )}
      <View style={styles.caseInfoContainer}>
        <Text style={styles.caseTitle}>{item.metadata.title}</Text>
        <Text style={styles.caseTagline}>{item.metadata.tagline}</Text>
        {/* Add more info like price/status from metadata if available */}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Available Cases</Text>
      <FlatList
        data={caseRegistry}
        renderItem={renderCaseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  caseItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden', // Ensures image corners are rounded if image is a direct child
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  caseImage: {
    width: 100,
    height: 120,
  },
  imagePlaceholderContainer: {
    width: 100,
    height: 120,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  caseInfoContainer: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  caseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  caseTagline: {
    fontSize: 14,
    color: '#666',
  },
}); 