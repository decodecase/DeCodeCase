import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, SafeAreaView, Dimensions, Alert } from 'react-native';

// Placeholder for dynamic bundle loading. In a real app, you might have a more robust registry or loading mechanism.
const loadBundleData = async (caseId) => {
  console.log(`[loadBundleData] Attempting to load bundle for caseId: ${caseId}`);
  try {
    switch (caseId) {
      case 'dead-air':
        console.log('[loadBundleData] Matched case: dead-air');
        const metadataModule = await import(`../../../../packages/case-bundles/dead-air/metadata.json`);
        console.log('[loadBundleData] Imported metadataModule:', metadataModule);
        const manifestModule = await import(`../../../../packages/case-bundles/dead-air/manifest.json`);
        console.log('[loadBundleData] Imported manifestModule:', manifestModule);
        const puzzlesModule = await import(`../../../../packages/case-bundles/dead-air/puzzles.json`);
        console.log('[loadBundleData] Imported puzzlesModule:', puzzlesModule);
        const coverImage = require('../../../../packages/case-bundles/dead-air/assets/images/deadair.png');
        console.log('[loadBundleData] Required coverImage:', coverImage);
        return {
          metadata: metadataModule,
          manifest: manifestModule,
          puzzles: puzzlesModule,
          coverImageRequire: coverImage,
        };
      // Add other cases here, e.g.:
      // case 'fading-minds':
      //   return {
      //     metadata: await import(`../../../../packages/case-bundles/${caseId}/metadata.json`),
      //     manifest: await import(`../../../../packages/case-bundles/${caseId}/manifest.json`),
      //     puzzles: await import(`../../../../packages/case-bundles/${caseId}/puzzles.json`),
      //     coverImageRequire: require(`../../../../packages/case-bundles/${caseId}/assets/images/cover.png`), // Generic path if cover image name is consistent or in metadata
      //   };
    default:
        console.log(`[loadBundleData] No case matched for caseId: ${caseId}`);
      return null;
  }
  } catch (error) {
    console.error('[loadBundleData] Error during import/require:', error);
    return null; // Ensure null is returned on error
  }
};

const { height: screenHeight } = Dimensions.get('window');

const CaseDetailScreen = ({ route, navigation }) => {
  const { caseId } = route.params;
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  
  useEffect(() => {
    console.log("CaseDetailScreen received caseId:", caseId);
    const fetchCaseData = async () => {
      setIsLoading(true);
      setCaseData(null); // Reset caseData before fetching
      console.log('[fetchCaseData] Starting to fetch for caseId:', caseId);
      try {
        const bundle = await loadBundleData(caseId);
        console.log('[fetchCaseData] Raw bundle from loadBundleData:', bundle);

        if (bundle && bundle.metadata && bundle.manifest && bundle.puzzles) {
          const newCaseData = {
            id: caseId,
            metadata: bundle.metadata.default || bundle.metadata,
            manifest: bundle.manifest.default || bundle.manifest,
            puzzles: bundle.puzzles.default || bundle.puzzles,
            coverImage: bundle.coverImageRequire,
            price: caseId === 'dead-air' ? 'Free' : '$10.99',
            status: 'Available',
          };
          console.log('[fetchCaseData] Processed newCaseData:', newCaseData);
          setCaseData(newCaseData);
        } else {
          console.log('[fetchCaseData] Bundle was null or incomplete.');
          setCaseData(null); // Ensure caseData is null if bundle is bad
        }
      } catch (error) {
        // This catch might be redundant if loadBundleData also catches and returns null,
        // but it's here for safety.
        console.error("[fetchCaseData] Error processing bundle:", error);
        setCaseData(null);
      }
      setIsLoading(false);
      console.log('[fetchCaseData] Finished fetching.');
    };

    if (caseId) {
      fetchCaseData();
    }
  }, [caseId]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, 
    });
  }, [navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaFullHeight}>
        <View style={styles.containerCenter}>
          <Text>Loading case details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!caseData) {
    return (
      <SafeAreaView style={styles.safeAreaFullHeight}> 
        <View style={styles.containerCenter}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.customHeaderBackButtonOnError}>
            <Text style={styles.customHeaderBackButtonTextOnError}>‹ Back</Text>
          </TouchableOpacity>
          <Text>Case not found or error loading.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayTitle = caseData.metadata?.title || 'Case Details';
  // Assuming manifest.scenes[0].file might point to an intro/summary markdown. Or use metadata.description.
  const displayDescription = caseData.metadata?.description || caseData.manifest?.scenes?.[0]?.title || 'No description available.';
  const imageSource = caseData.coverImage;

  const handleViewSummary = () => {
    setShowSummary(!showSummary);
  };

  const handleAction = () => {
    if (caseData.status === 'Available') {
      if (caseData.price === 'Free') {
        // TODO: Navigate to InvestigationDashboardScreen and pass necessary data / trigger engine load
        Alert.alert("Play Case", `Proceed to play ${displayTitle}`);
        // navigation.navigate('InvestigationDashboardScreen', { caseId: caseData.id }); 
      } else {
        navigation.navigate('CheckoutScreen', { caseId: caseData.id, caseTitle: displayTitle, price: caseData.price });
      }
    } else if (caseData.status === 'Owned' || caseData.status === 'Play Now') {
      // TODO: Navigate to InvestigationDashboardScreen and pass necessary data / trigger engine load
      Alert.alert("Play Case", `Proceed to play ${displayTitle}`);
      // navigation.navigate('InvestigationDashboardScreen', { caseId: caseData.id }); 
    } else if (caseData.status === 'Coming Soon') {
      Alert.alert('This case is coming soon!');
    }
  };

  let buttonText = 'Play';
  let buttonDisabled = false;
  if (caseData.status === 'Available') {
    buttonText = caseData.price === 'Free' ? 'Play' : `Buy (${caseData.price})`;
  } else if (caseData.status === 'Coming Soon') {
    buttonText = 'Coming Soon';
    buttonDisabled = true;
  }

  return (
    <SafeAreaView style={styles.safeAreaFullHeight}>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContentContainer}
        bounces={false} 
        showsVerticalScrollIndicator={false}
      >
          {imageSource ? (
              <Image source={imageSource} style={styles.caseImageActual} resizeMode="contain" />
          ) : (
              <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>{displayTitle}</Text>
              </View>
          )}
      </ScrollView>
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{displayTitle}</Text>
        <TouchableOpacity 
          style={styles.summaryButton}
          onPress={handleViewSummary}
        >
          <Text style={styles.summaryButtonText}>{showSummary ? 'Hide Summary' : 'View Summary'}</Text>
        </TouchableOpacity>
        
        {showSummary && (
          <Text style={styles.description}>{displayDescription}</Text>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, buttonDisabled && styles.disabledButton]}
          onPress={handleAction}
          disabled={buttonDisabled}
        >
          <Text style={styles.actionButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#1c1c1e', 
    justifyContent: 'space-between', 
  },
  scrollContainer: {
    // flex: 1, // Removed flex: 1
  },
  scrollContentContainer: { 
    flexGrow: 1,
    justifyContent: 'center',
  },
  containerCenter: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1c1c1e', // Match background
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
    height: screenHeight * 0.4, 
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
     height: screenHeight * 0.65, 
     backgroundColor: '#000', 
  },
  detailsContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, 
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28, // Increased size
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  summaryButton: {
    backgroundColor: '#333333', // Darker button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 15,
  },
  summaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 15, // Slightly larger description
    color: '#e0e0e0', // Lighter text for dark background
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 22, // Improved readability
  },
  actionButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10, // Ensure some space
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CaseDetailScreen; 