import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';

// Placeholder data for cases
const CASES_DATA = [
  { id: '1', title: 'The Final Note', price: '$10.99', imageName: 'thefinalnote.png', status: 'Coming Soon' },
  // Duplicates for carousel
  { id: '2_cs', title: 'Fading Minds', price: '$10.99', imageName: 'fadingminds.png', status: 'Coming Soon' },
  { id: 'deadAir_cs', title: 'Dead Air', price: 'Free', imageName: 'deadair.png', status: 'Coming Soon' },
  // Original Available Cases
  { id: '2', title: 'Fading Minds', price: '$10.99', imageName: 'fadingminds.png', status: 'Available' },
  { id: 'dead-air', title: 'Dead Air', price: 'Free', imageName: 'deadair.png', status: 'Available' },
  // ... more cases
];

// Helper to get image source
const getCaseImageSource = (imageName) => {
  switch (imageName) {
    case 'thefinalnote.png':
      return require('../assets/images/thefinalnote.png');
    case 'fadingminds.png':
      return require('../assets/images/fadingminds.png');
    case 'deadair.png':
      return require('../assets/images/deadair.png');
    default:
      return null; // Or a placeholder image
  }
};

const { width: screenWidth } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = screenWidth * 0.6;
const CAROUSEL_ITEM_HORIZONTAL_MARGIN = 10;

const HomeScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const comingSoonCases = CASES_DATA.filter(c => c.status === 'Coming Soon');

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentCarouselIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentCarouselIndex < comingSoonCases.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentCarouselIndex + 1 });
    }
  };

  const scrollToPrev = () => {
    if (currentCarouselIndex > 0) {
      flatListRef.current.scrollToIndex({ index: currentCarouselIndex - 1 });
    }
  };

  const renderCaseItem = ({ item, isCarouselItem = false }) => { 
    const imageSource = getCaseImageSource(item.imageName);
    
    const itemStyle = isCarouselItem ? styles.carouselCaseItem : styles.caseItem;
    const imageContainerStyle = isCarouselItem ? styles.carouselImageContainer : styles.caseImageContainer;

    return (
      <TouchableOpacity
        style={itemStyle}
        onPress={() => navigation.navigate('CaseDetailScreen', { caseId: item.id, caseTitle: item.title })}
      >
        <View style={imageContainerStyle}>
          {imageSource ? (
            <Image source={imageSource} style={styles.caseImage} resizeMode="cover" />
          ) : (
            <View style={styles.caseImagePlaceholder}><Text style={styles.caseImagePlaceholderText}>{item.title.substring(0,2)}</Text></View>
          )}
          <View style={styles.priceTagContainer}>
            <Text style={styles.casePrice}>{item.price}</Text>
            {item.status === 'Coming Soon' && !isCarouselItem && <Text style={[styles.caseStatus, styles.comingSoonText]}>{item.status}</Text>}
            {isCarouselItem && <Text style={[styles.caseStatus, styles.comingSoonText]}>Soon</Text>} 
          </View>
        </View>
        {isCarouselItem && <Text style={styles.carouselItemTitle} numberOfLines={1}>{item.title}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DECODECASE</Text>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <View style={styles.carouselContainer}> {/* Wrapper for FlatList and arrows */}
          <FlatList
            ref={flatListRef}
            data={comingSoonCases}
            renderItem={(props) => renderCaseItem({ ...props, isCarouselItem: true })}
            keyExtractor={item => `carousel-${item.id}`}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CAROUSEL_ITEM_WIDTH + (CAROUSEL_ITEM_HORIZONTAL_MARGIN * 2)}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={styles.carouselListContainer}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            ListEmptyComponent={<Text style={styles.emptyListText}>No cases coming soon.</Text>}
          />
          {comingSoonCases.length > 1 && (
            <>
              <TouchableOpacity onPress={scrollToPrev} style={[styles.arrowButton, styles.arrowLeft]} disabled={currentCarouselIndex === 0}>
                <Text style={styles.arrowText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={scrollToNext} style={[styles.arrowButton, styles.arrowRight]} disabled={currentCarouselIndex === comingSoonCases.length - 1}>
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Available Cases</Text>
        <FlatList
          data={CASES_DATA.filter(c => c.status !== 'Coming Soon')}
          renderItem={renderCaseItem} // isCarouselItem will be false by default
          keyExtractor={item => item.id}
          numColumns={2} 
          ListEmptyComponent={<Text style={styles.emptyListText}>No cases currently available.</Text>}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingTop: 10, 
    paddingBottom: 10,
    backgroundColor: '#2a2a2d',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontFamily: 'Girassol-Regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 15,
    marginHorizontal: 5,
    color: '#ffffff',
  },
  carouselContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  carouselListContainer: {
    paddingVertical: 10,
    paddingHorizontal: (screenWidth - CAROUSEL_ITEM_WIDTH) / 2 - CAROUSEL_ITEM_HORIZONTAL_MARGIN,
  },
  caseItem: {
    flex: 1,
    margin: 10,
    backgroundColor: '#2a2a2d',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4, 
  },
  carouselCaseItem: {
    width: CAROUSEL_ITEM_WIDTH,
    marginHorizontal: CAROUSEL_ITEM_HORIZONTAL_MARGIN,
    backgroundColor: '#2a2a2d',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    alignItems: 'center',
    paddingBottom: 5,
  },
  caseImageContainer: {
    width: '100%',
    aspectRatio: 0.5625,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  carouselImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 5,
  },
  caseImage: {
    width: '100%',
    height: '100%',
  },
  caseImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3e3e40',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  caseImagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#a0a0a0'
  },
  priceTagContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignItems: 'flex-end'
  },
  casePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  caseStatus: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 2,
  },
  comingSoonText: {
    color: '#FFD700',
  },
  carouselItemTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#a0a0a0',
    fontSize: 16,
    width: screenWidth,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  arrowLeft: {
    left: (screenWidth - CAROUSEL_ITEM_WIDTH) / 2 - CAROUSEL_ITEM_HORIZONTAL_MARGIN - 54,
  },
  arrowRight: {
    right: (screenWidth - CAROUSEL_ITEM_WIDTH) / 2 - CAROUSEL_ITEM_HORIZONTAL_MARGIN - 54,
  },
  arrowText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 26,
  },
});

export default HomeScreen;