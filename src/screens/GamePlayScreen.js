import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import the case data service
import { getCaseDataById } from '../data/caseDataService.js';

// --- Reusable Components for Displaying Case Data ---

// Updated InfoBlock to handle potential icon and adjusted speaker styling
const InfoBlock = ({ title, content, isTranscript = false, iconName = null, textStyle = null }) => {
  const renderContent = () => {
    const styleToUse = [styles.infoBlockContent, textStyle]; // Apply custom text style if provided
    if (isTranscript) {
      const lines = content.split('\n');
      return lines.map((line, index) => {
        const parts = line.match(/^([A-ZİÜĞŞÇÖ\s]+):(.*)$/); 
        if (parts && parts[1] && parts[2]) {
          return (
            <Text key={index} style={styleToUse}>
              <Text style={styles.transcriptSpeakerName}>{parts[1].trim()}:</Text> 
              {parts[2]}
            </Text>
          );
        }
        return <Text key={index} style={styleToUse}>{line}</Text>;
      });
    }
    // Consolidate multiple newlines AND replace single newlines within text with spaces
    const processedContent = content
                                .replace(/(\S)\n(\S)/g, '$1 $2') // Replace single newline between non-whitespace chars with a space
                                .replace(/\n{2,}/g, '\n\n'); // Consolidate multiple newlines
    return <Text style={styleToUse}>{processedContent}</Text>;
  };

  return (
    <View style={styles.infoBlockContainer}> 
      {iconName && <Ionicons name={iconName} size={20} color="#FFD700" style={styles.infoBlockIcon} />}
      <View style={styles.infoBlockTextContainer}>
        {title && <Text style={styles.infoBlockTitle}>{title}</Text>}
        {renderContent()}
      </View>
    </View>
  );
};

// Collapsible Component for Evidence/Interrogations
const CollapsibleSection = ({ title, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <View style={styles.collapsibleContainer}>
      <TouchableOpacity 
        style={styles.collapsibleHeader}
        onPress={() => setIsCollapsed(!isCollapsed)}
        activeOpacity={0.7}
      >
        <Text style={styles.collapsibleTitle}>{title}</Text>
        <Text style={styles.collapsibleIcon}>{isCollapsed ? '▼' : '▲'}</Text>
      </TouchableOpacity>
      {!isCollapsed && (
        <View style={styles.collapsibleContent}>
          {children}
        </View>
      )}
    </View>
  );
};

// --- Main GamePlayScreen Component ---

const GamePlayScreen = ({ route, navigation }) => {
  const { caseId } = route.params; 
  const [activeSectionKey, setActiveSectionKey] = useState('CaseIntro');
  const [caseData, setCaseData] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // State for image modal
  const [selectedImageSource, setSelectedImageSource] = useState(null); // State for modal image

  // Load Case Data based on caseId using the service
  useEffect(() => {
    const data = getCaseDataById(caseId);
    if (data) {
      setCaseData(data);
      setActiveSectionKey('CaseIntro'); // Start at the intro for the loaded case
    } else {
      // Handle case data not found (e.g., navigate back, show error, or load placeholder)
      console.error('Failed to load case data for:', caseId);
      setCaseData(null); // Ensure caseData is null if not found
      // Optionally, navigate back or show an error message to the user
      // navigation.goBack(); 
      // alert('Error: Could not load case details.');
    }
    setShowSolution(false); // Reset solution visibility when case changes
  }, [caseId, navigation]); // Added navigation to dependency array if used in error handling

  // --- Menu Items --- Updated with Ionicon names
  const menuItems = [
    { key: 'CrimeScene', label: 'Crime Scene', iconName: 'map-outline' },
    { key: 'EvidenceFolder', label: 'Evidence', iconName: 'folder-open-outline' },
    { key: 'WitnessStatements', label: 'Interrogations', iconName: 'chatbubbles-outline' },
    { key: 'AutopsyReport', label: 'Autopsy', iconName: 'medkit-outline' }, 
    { key: 'TechnicalAnalysis', label: 'Tech Analysis', iconName: 'desktop-outline' }, 
    { key: 'Conclusion', label: 'Conclusion', iconName: 'flag-outline' },
  ];
  
  // Example: Dynamically create menuItems based on available sections in caseData
  // This is more advanced and requires caseData to have a predictable structure for sections.
  // const dynamicMenuItems = caseData ? Object.keys(caseData.sections || {}).map(key => ({
  //   key: key,
  //   label: caseData.sections[key].menuLabel || key, // Assuming sections have a menuLabel
  //   icon: caseData.sections[key].menuIcon || '❓'
  // })) : [];

  const openImageModal = (source) => {
      if (source) {
          setSelectedImageSource(source);
          setModalVisible(true);
      }
  };

  // Helper to get a default icon if no specific match
  const getIconForKey = (key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('date') || lowerKey.includes('time')) return 'calendar-outline';
    if (lowerKey.includes('location')) return 'location-outline';
    if (lowerKey.includes('interrogator') || lowerKey.includes('suspect') || lowerKey.includes('victim') || lowerKey.includes('examiner') || lowerKey.includes('preparedby') || lowerKey.includes('subject')) return 'person-outline';
    if (lowerKey.includes('transcript') || lowerKey.includes('summary') || lowerKey.includes('description') || lowerKey.includes('report') || lowerKey.includes('introduction') || lowerKey.includes('medium') || lowerKey.includes('content')) return 'document-text-outline';
    if (lowerKey.includes('note') || lowerKey.includes('clues') || lowerKey.includes('details')) return 'pencil-outline';
    if (lowerKey.includes('technical') || lowerKey.includes('digital') || lowerKey.includes('system') || lowerKey.includes('frequency') || lowerKey.includes('electrophysiological')) return 'hardware-chip-outline';
    if (lowerKey.includes('relevance') || lowerKey.includes('conclusion') || lowerKey.includes('recommendation') || lowerKey.includes('finding')) return 'bulb-outline';
    if (lowerKey.includes('method') || lowerKey.includes('acquisition') || lowerKey.includes('access')) return 'key-outline';
    if (lowerKey.includes('timeline')) return 'time-outline';
    if (lowerKey.includes('autopsy') || lowerKey.includes('toxicology') || lowerKey.includes('internalexamination') || lowerKey.includes('conditionofbody')) return 'body-outline';
    if (lowerKey.includes('reference') || lowerKey.includes('casenumber')) return 'folder-outline';
    if (lowerKey.includes('generalinfo')) return 'information-circle-outline';
    return 'information-circle-outline'; // Default icon
  }

  // --- Content Rendering Logic ---
  const renderContent = () => {
    if (!caseData) {
      return <View style={styles.sectionView}><Text style={styles.sectionText}>Loading Case Data...</Text></View>;
    }

    // Determine background style based on active section
    let sectionSpecificContentStyle = {};
    if (activeSectionKey === 'CrimeScene') {
      sectionSpecificContentStyle = styles.crimeSceneContentContainer;
    } else if (activeSectionKey === 'AutopsyReport') {
      sectionSpecificContentStyle = styles.autopsyContentContainer;
    }

    switch (activeSectionKey) {
      case 'CaseIntro':
        return (
          <ScrollView contentContainerStyle={styles.contentScrollViewContainer} style={styles.contentScrollView}>
            <View style={styles.gameIntroContainer}>
              {caseData.coverImage ? (
                <Image source={caseData.coverImage} style={styles.gameBannerImage} resizeMode="contain" />
              ) : (
                <View style={styles.gameBannerPlaceholder}><Text style={styles.gameBannerText}>{caseData.title}</Text></View>
              )}
              <TouchableOpacity style={styles.playButton} onPress={() => setActiveSectionKey(menuItems[0]?.key || 'CrimeScene')}>
                <Text style={styles.playButtonText}>Begin Investigation</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      case 'CrimeScene':
        return (
          <ScrollView style={styles.contentScrollView} contentContainerStyle={{ padding: 15 }}>
             <Text style={styles.contentTitle}>Crime Scene</Text> 
             <View style={styles.reportSheet}>
                {/* Render title separately for styling if needed */}
                <Text style={styles.reportSectionTitle}>Crime Scene Report</Text>
                {/* Render summary text directly, applying reportText style */}
                <Text style={styles.reportText}>
                  {caseData.crimeSceneReport?.summary || 'No report available.'}
                </Text>
             </View>
          </ScrollView>
        );
      case 'EvidenceFolder':
        return (
          <ScrollView style={styles.contentScrollView} contentContainerStyle={{ padding: 15 }}>
            <Text style={styles.contentTitle}>Evidence Folder</Text>
            {caseData.evidenceReports?.map(report => {
              const imageSource = report.imageSource;
              const imageDetailSource = report.imageDetailSource; 

              return (
                <CollapsibleSection key={report.id} title={report.title}>
                  {imageSource && (
                    <TouchableOpacity onPress={() => openImageModal(imageSource)}>
                      <Image source={imageSource} style={styles.evidenceImage} resizeMode="contain" />
                    </TouchableOpacity>
                  )}
                  {imageDetailSource && (
                    <TouchableOpacity onPress={() => openImageModal(imageDetailSource)}>
                       <Image source={imageDetailSource} style={styles.evidenceDetailImage} resizeMode="contain" />
                    </TouchableOpacity>
                  )}
                  {Object.entries(report).map(([key, value]) => {
                    if (key === 'id' || key === 'title' || !value || key === 'imageName' || key === 'imageDetailName' || key === 'imageSource' || key === 'imageDetailSource') return null;
                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const icon = getIconForKey(key);
                    return <InfoBlock key={key} title={formattedKey} content={value.toString()} iconName={icon} />;
                  })}
                </CollapsibleSection>
              );
            }) || <Text style={styles.sectionText}>No evidence available.</Text>}
          </ScrollView>
        );
       case 'WitnessStatements':
        return (
          <ScrollView style={styles.contentScrollView} contentContainerStyle={{ padding: 15 }}>
             <Text style={styles.contentTitle}>Interrogations</Text>
             {caseData.interrogations?.map(int => {
               const characterImageSource = int.characterImageSource;
               return (
                 <CollapsibleSection key={int.id} title={int.suspect}> 
                   <View style={styles.interrogationHeaderContainer}>
                      {characterImageSource && (
                        <Image source={characterImageSource} style={styles.characterImage} resizeMode="contain" />
                      )}
                      <Text style={styles.interrogationSuspectName}>{int.suspect}</Text>
                   </View>
                   
                   {Object.entries(int).map(([key, value]) => {
                      if (key === 'id' || key === 'suspect' || !value || key === 'characterImageName' || key === 'characterImageSource') return null;
                      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      const icon = getIconForKey(key);

                      if (key === 'transcript') {
                         return <InfoBlock key={key} title={formattedKey} content={value.toString()} isTranscript={true} iconName={icon} />;
                      } else {
                         return <InfoBlock key={key} title={formattedKey} content={value.toString()} iconName={icon} />;
                      } 
                   })}
                 </CollapsibleSection>
               );
             }) || <Text style={styles.sectionText}>No interrogations available.</Text>}
          </ScrollView>
        );
      case 'AutopsyReport':
         // Placeholder until new logic is added
        return (
          <ScrollView style={styles.contentScrollView} contentContainerStyle={{ padding: 15 }}>
            <Text style={styles.contentTitle}>Autopsy Report</Text>
            <Text style={styles.sectionText}>Autopsy Report rendering coming soon...</Text>
          </ScrollView>
        );
      case 'TechnicalAnalysis':
        return (
          <ScrollView style={styles.contentScrollView} contentContainerStyle={{ padding: 15 }}>
             <Text style={styles.contentTitle}>Technical Analysis</Text>
             {caseData.technicalAnalysisReport ? (
                 Object.entries(caseData.technicalAnalysisReport).map(([key, value]) => {
                   const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                   let contentString = value.toString();
                   if (Array.isArray(value)) {
                       contentString = value.map(c => (typeof c === 'string' ? c.startsWith('[') && c.endsWith(']') ? c : `- ${c}` : c.toString())).join('\n');
                   }
                   const icon = getIconForKey(key);
                   return <InfoBlock key={key} title={formattedKey} content={contentString} iconName={icon} />;
                 })
             ) : <Text style={styles.sectionText}>No technical analysis available.</Text>}
          </ScrollView>
        );
      case 'Conclusion':
        return (
          <ScrollView style={styles.contentScrollView} contentContainerStyle={{ padding: 15 }}>
            <Text style={styles.contentTitle}>Conclusion</Text>
            {caseData.solutionSection ? (
              <View>
                <InfoBlock title={caseData.solutionSection.title} content={Array.isArray(caseData.solutionSection.intro) ? caseData.solutionSection.intro.join('\n') : caseData.solutionSection.intro} iconName={getIconForKey('conclusion')} />
                <TouchableOpacity style={styles.revealButton} onPress={() => setShowSolution(true)}>
                  <Text style={styles.revealButtonText}>Reveal Hints & Solution</Text>
                </TouchableOpacity>
                {showSolution && (
                  <View>
                     <InfoBlock title={caseData.solutionSection.passwordHintsLinkText} content={Array.isArray(caseData.solutionSection.passwordHintsContent) ? caseData.solutionSection.passwordHintsContent.join('\n') : caseData.solutionSection.passwordHintsContent} iconName={getIconForKey('hint')} />
                     <InfoBlock title={caseData.solutionSection.revealSolutionLinkText} content={"---> " + caseData.solutionSection.solutionLinkName + " <---"} iconName={getIconForKey('solution')} />
                     <InfoBlock title="" content={Array.isArray(caseData.solutionSection.thankYouMessage) ? caseData.solutionSection.thankYouMessage.join('\n') : caseData.solutionSection.thankYouMessage} iconName={getIconForKey('thankyou')} />
                  </View>
                )}
              </View>
            ) : <Text style={styles.sectionText}>Conclusion not available.</Text>}
          </ScrollView>
        );
      default:
        return <ScrollView style={styles.contentScrollView} contentContainerStyle={{ padding: 15 }}><View style={styles.sectionView}><Text style={styles.sectionText}>Select a section</Text></View></ScrollView>;
    }
  };

  return (
    <View style={styles.backgroundImage}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close-circle" size={35} color="#fff" />
          </TouchableOpacity>
          {selectedImageSource && (
            <Image 
              source={selectedImageSource} 
              style={styles.modalImage} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>

      <View style={styles.container}>
          {/* Header with Back Button */}
          <View style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>‹</Text>
                 </TouchableOpacity>
                 <Text style={styles.headerTitle}>{caseData?.title || 'Game Play'}</Text>
                 <View style={{width: 40}} /> {/* Spacer for balance */}
          </View>
          {/* Horizontal Scrollable Menu */}
          <View style={styles.topMenuContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topMenuScroll}>
                  {menuItems.map(item => (
                      <TouchableOpacity
                          key={item.key}
                          style={[styles.topMenuItem, activeSectionKey === item.key && styles.activeTopMenuItem]}
                          onPress={() => setActiveSectionKey(item.key)}
                      >
                          <Ionicons name={item.iconName} size={20} color={activeSectionKey === item.key ? '#ffffff' : '#e0e0e0'} style={styles.topMenuIcon}/>
                          <Text style={[styles.topMenuItemText, activeSectionKey === item.key && styles.activeTopMenuItemText]}>{item.label}</Text>
                      </TouchableOpacity>
                  ))}
              </ScrollView>
          </View>
          {/* Main Content Area */}
          <View style={styles.mainContent}>
              {renderContent()}
          </View>
      </View>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 40, // Status bar height
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  backArrow: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topMenuContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topMenuScroll: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  topMenuItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20, // Rounded tabs
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeTopMenuItem: {
     backgroundColor: '#5D3FD3', // Accent color for active tab
  },
  topMenuIcon: {
      marginBottom: 2, // Space between icon and text
  },
  topMenuItemText: {
    color: '#e0e0e0',
    fontSize: 11, // Slightly smaller maybe
    fontWeight: '600',
  },
  activeTopMenuItemText: {
      color: '#ffffff', // Ensure text is white on active tab
  },
  mainContent: {
    flex: 1, // Allow main content to take remaining vertical space
  },
  contentScrollView: {
    flex: 1, // Let ScrollView fill the mainContent area
  },
  contentScrollViewContainer: { // For ScrollViews that need centering OR padding at the bottom
    padding: 15, // Added padding
    flexGrow: 1, // Ensure content can grow if needed
  },
  contentTitle: {
      fontSize: 24, // Larger title
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 20, // More space below title
      textAlign: 'center',
  },
  sectionView: { // Fallback view
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    borderRadius: 10,
    padding: 20,
  },
  sectionText: {
      color: '#fff',
      fontSize: 16, // Smaller default text
  },
  // Styles for specific content types
  infoBlockContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 12,
      alignItems: 'flex-start', // Align icon and text block top
  },
  infoBlockIcon: {
      marginRight: 10,
      marginTop: 2, // Adjust vertical alignment with text
  },
  infoBlockTextContainer: {
      flex: 1, // Allow text to take remaining space
  },
  infoBlockTitle: {
    fontSize: 17, // Slightly smaller title
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 6, 
  },
  infoBlockContent: {
    fontSize: 15,
    color: '#e0e0e0',
    lineHeight: 22, // Adjusted line height
  },
  transcriptSpeakerName: {
    fontWeight: 'bold',
    color: '#FFA07A', // Different color (Light Salmon) - Adjust as needed
    textDecorationLine: 'underline', // Underline speaker
  },
  // Evidence Styles
  evidenceImage: {
    width: '100%',
    height: 250, // Slightly larger default evidence image
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'center',
  },
  evidenceDetailImage: {
    width: '90%', 
    height: 200, 
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 5, 
    alignSelf: 'center',
  },
  // Interrogation Styles
  interrogationHeaderContainer: { // Container for image + maybe name
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  characterImage: {
    width: 150, // Larger character image
    height: 150,
    borderRadius: 75, // Keep it circular
    marginRight: 15, // Space between image and details
    borderWidth: 2,
    borderColor: '#FFD700', 
  },
  interrogationSuspectName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff',
      flexShrink: 1, // Allow name to wrap if long
      // Add a distinct font family if available and desired
      // fontFamily: 'YourDistinctFontFamily', 
  },
  // Collapsible Section Styles remain largely the same
  collapsibleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  collapsibleTitle: {
    fontSize: 17, 
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  collapsibleIcon: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFD700',
  },
  collapsibleContent: {
    padding: 15,
    paddingTop: 10,
  },
  // Conclusion Styles
  revealButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  revealButtonText: {
      color: '#1c1c1e', 
      fontSize: 16,
      fontWeight: 'bold',
  },
  // Intro Screen Styles
  gameIntroContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
  },
  gameBannerImage: {
      width: '100%', 
      maxWidth: 350, 
      height: 220, 
      marginBottom: 25,
      borderRadius: 10,
  },
  gameBannerPlaceholder: {
      width: '90%',
      height: 200, 
      maxWidth: 350,
      backgroundColor: '#2a2a2d', 
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#444',
  },
  gameBannerText: {
      color: '#fff',
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  gameDescription: { // Can be reused if intro text is added
      fontSize: 15,
      color: '#e0e0e0', 
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 25,
      paddingHorizontal: 5, 
  },
  playButton: {
    backgroundColor: '#5D3FD3', 
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 20, 
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Dark semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '80%', // Adjust size as needed
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 50,
    right: 20,
    zIndex: 10,
  },
  // Report Sheet Style (for Crime Scene)
  reportSheet: {
    backgroundColor: 'rgba(248, 248, 240, 0.9)', // Faint off-white, slightly transparent
    borderRadius: 5,
    padding: 15,
    marginHorizontal: 5, // Give it slight horizontal margin
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reportSectionTitle: { // Added style for the report title itself
      fontSize: 18, 
      fontWeight: 'bold',
      color: '#000', // Dark title on light background
      marginBottom: 15,
      textAlign: 'center',
      textTransform: 'uppercase',
  },
  reportText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', // Monospace font
    color: '#333', // Dark text on light background
    fontSize: 14, // Slightly smaller for report feel
    lineHeight: 20,
  },
  // Specific content container styles for themes
  crimeSceneContentContainer: {
      backgroundColor: '#f5f5dc', // Parchment/Beige color
  },
  autopsyContentContainer: {
      backgroundColor: '#e0f2f7', // Light clinical blue/grey
  },
});

export default GamePlayScreen; 