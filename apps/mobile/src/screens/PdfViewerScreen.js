import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@react-navigation/native';

const PdfViewerScreen = ({ route }) => {
  const { pdfPath } = route.params;
  const { colors } = useTheme();

  // Log the PDF path to ensure it's being passed correctly
  console.log('PdfViewerScreen received pdfPath:', pdfPath);

  // Validate the pdfPath (simplified)
  if (!pdfPath || typeof pdfPath !== 'string') {
    console.error('Invalid or missing pdfPath:', pdfPath);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Invalid PDF path provided.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {Platform.OS === 'web' ? (
        // Render an iframe for web
        <iframe
          src={pdfPath} // Use the passed path directly
          style={styles.iframe} // Apply styles
          title="PDF Viewer"
        />
      ) : (
        // Render WebView for native platforms (iOS, Android)
        <WebView
          source={{ uri: pdfPath }}
          style={styles.webview}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator
              color={colors.primary}
              size="large"
              style={styles.loadingIndicator}
            />
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn(
              'WebView HTTP error: ',
              nativeEvent.url,
              nativeEvent.statusCode,
              nativeEvent.description
            );
          }}
          allowsInlineMediaPlayback={true} // For iOS, might help with some PDFjs viewers
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  iframe: { // Add styles for iframe
    flex: 1,
    width: '100%',
    height: '100%',
    borderWidth: 0, // Remove default iframe border
  },
  loadingIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PdfViewerScreen; 