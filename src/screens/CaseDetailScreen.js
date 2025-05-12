import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, SafeAreaView, Dimensions } from 'react-native';

// Import specific case data
import { deadAirCaseData } from '../data/deadAirData.js';

// Helper to get image source - for other cases if any
const getCaseImageSource = (imageName) => {
  if (!imageName) return null;
  switch (imageName) {
    case 'thefinalnote.png':
      return require('../assets/images/thefinalnote.png');
    case 'fadingminds.png':
      return require('../assets/images/fadingminds.png');
    // deadair.png is handled directly from deadAirCaseData.coverImage if caseId is 'deadAir'
    // case 'deadair.png': 
    //   return require('../assets/images/deadair.png');
    default:
      return null;
  }
};

// Placeholder data for cases - this can be simplified or used as a fallback
const getCaseDetailsFromPlaceholder = (caseId) => {
  const allCases = {
    '1': { 
      id: '1',
      title: 'The Final Note',
      imageName: 'thefinalnote.png',
      description: 'Unravel the mystery behind the composer\'s final, cryptic composition. Was it a suicide note or a cleverly disguised confession?',
      price: '$10.99',
      status: 'Coming Soon'
    },
    '2': { 
      id: '2',
      title: 'FADING MINDS',
      imageName: 'fadingminds.png',
      description: 'FADING MINDS plunges you into the eerie halls of the Amwell NeuroScience Center, where an experiment to erase traumatic memories has gone catastrophically wrong. Ten participants entered seeking relief – only one never made it out alive. As the investigator, it\'s up to you to navigate a maze of fractured testimonies, hidden system overrides, encrypted files, and buried secrets. In a world where memory is fragile and truth is easily manipulated, can you uncover who turned the promise of healing into cold-blooded murder?',
      price: '$10.99',
      status: 'Available'
    },
    // Data for 'deadAir' will now primarily come from imported deadAirCaseData
    'deadAir': { 
      id: 'deadAir',
      title: 'Dead Air', // Will be overridden by deadAirCaseData.title
      imageName: 'deadair.png', // Will be overridden by deadAirCaseData.coverImage
      description: 'A late-night radio host is found dead during his live broadcast. Was it a technical malfunction, a hidden message gone wrong, or something more sinister echoing through the airwaves?', // Will be overridden
      price: 'Free', // Keep price and status from here
      status: 'Available' 
    }
  };
  return allCases[caseId] || null;
};

const { height: screenHeight } = Dimensions.get('window'); // Get screen height

const CaseDetailScreen = ({ route, navigation }) => {
  const { caseId } = route.params;
  
  let caseDetails;
  let imageSource;
  let displayTitle;
  let displayDescription;

  const placeholderData = getCaseDetailsFromPlaceholder(caseId);

  if (caseId === 'deadAir') {
    caseDetails = { // Combine data
      ...placeholderData, // For price, status, and any other common fields
      ...deadAirCaseData, // Overrides title, description, image from deadAirCaseData
    };
    displayTitle = deadAirCaseData.title;
    displayDescription = deadAirCaseData.crimeSceneReport?.summary || placeholderData?.description || 'No description available.';
    imageSource = deadAirCaseData.coverImage; // Directly use the require statement
  } else {
    caseDetails = placeholderData;
    if (caseDetails) {
      displayTitle = caseDetails.title;
      displayDescription = caseDetails.description;
      imageSource = getCaseImageSource(caseDetails.imageName);
    }
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, 
    });
  }, [navigation]);

  if (!caseDetails) {
    return (
      <SafeAreaView style={styles.safeAreaFullHeight}> 
        <View style={styles.containerCenter}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.customHeaderBackButtonOnError}>
            <Text style={styles.customHeaderBackButtonTextOnError}>‹ Back</Text>
          </TouchableOpacity>
          <Text>Case not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAction = () => {
    if (caseDetails.status === 'Available') {
      if (caseDetails.price === 'Free') {
        navigation.navigate('GamePlay', { caseId: caseDetails.id });
      } else {
        navigation.navigate('Checkout', { caseId: caseDetails.id, caseTitle: displayTitle, price: caseDetails.price });
      }
    } else if (caseDetails.status === 'Owned' || caseDetails.status === 'Play Now') {
      navigation.navigate('GamePlay', { caseId: caseDetails.id });
    } else if (caseDetails.status === 'Coming Soon') {
      alert('This case is coming soon!');
    }
  };

  let buttonText = 'Play';
  let buttonDisabled = false;
  if (caseDetails.status === 'Available') {
    buttonText = caseDetails.price === 'Free' ? 'Play' : `Buy (${caseDetails.price})`;
  } else if (caseDetails.status === 'Coming Soon') {
    buttonText = 'Coming Soon';
    buttonDisabled = true;
  }

  return (
    <SafeAreaView style={styles.safeAreaFullHeight}>
      <ScrollView style={styles.scrollContainer} bounces={false} showsVerticalScrollIndicator={false}>
          {imageSource ? (
              <Image source={imageSource} style={styles.caseImageActual} resizeMode="cover" />
          ) : (
              <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>{displayTitle}</Text>
              </View>
          )}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.description}>{displayDescription}</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, buttonDisabled && styles.disabledButton]}
            onPress={handleAction}
            disabled={buttonDisabled}
          >
            <Text style={styles.actionButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Custom Header Overlay */}
      <View style={styles.customHeaderOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.customHeaderBackButton}>
          <Text style={styles.customHeaderBackButtonText}>‹</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaFullHeight: { 
    flex: 1,
    backgroundColor: '#1c1c1e', // Changed to dark background
  },
  scrollContainer: { // Renamed from container to avoid confusion
    flex: 1,
    // backgroundColor: '#ffffff', // Removed, inherits from safeArea or shows image
  },
  containerCenter: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  customHeaderOverlay: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 10 : 40, 
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 50, 
    zIndex: 10, 
  },
  customHeaderBackButton: {
    padding: 10, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    borderRadius: 20, 
  },
  customHeaderBackButtonText: {
    fontSize: 28, 
    color: '#fff',
    fontWeight: 'bold',
  },
  customHeaderBackButtonOnError: {
    position: 'absolute', 
    top: Platform.OS === 'android' ? 15 : 50, 
    left: 15,
    padding: 5,
  },
  customHeaderBackButtonTextOnError: {
      fontSize: 18,
      color: '#5D3FD3', 
      fontWeight: 'bold',
  },
  imagePlaceholder: {
    height: screenHeight * 0.4, // Use a portion of screen height for placeholder as well
    backgroundColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 24,
    color: '#555555',
    fontWeight: 'bold',
  },
  caseImageActual: {
     width: '100%',
     height: screenHeight * 0.45, // Set height to 45% of screen height
     // aspectRatio: 0.5625, // aspectRatio is overridden by explicit height
  },
  detailsContainer: {
    padding: 20,
    paddingTop: 25, 
    backgroundColor: 'rgba(25, 25, 27, 0.9)', // Changed to semi-transparent dark
    marginTop: -30, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    minHeight: screenHeight * 0.60, // Ensure details take up at least 60% of screen height
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#ffffff', // Changed to light color
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 25,
    color: '#e0e0e0', // Changed to light color
  },
  actionButton: {
    backgroundColor: '#5D3FD3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#555555',
  }
});

export default CaseDetailScreen; 