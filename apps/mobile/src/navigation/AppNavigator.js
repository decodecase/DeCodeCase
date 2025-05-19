import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import CaseDetailScreen from '../screens/CaseDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
// import GamePlayScreen from '../screens/GamePlayScreen';
import PdfViewerScreen from '../screens/PdfViewerScreen';

// Placeholder screens for bottom tabs
const PlaceholderScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{route.name} Screen</Text>
  </View>
);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator (for main app sections)
const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeCases') {
            iconName = focused ? 'folder-open' : 'folder-open-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5D3FD3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Headers will be handled by StackNav or within screens
      })}
    >
      <Tab.Screen name="HomeCases" component={HomeScreen} options={{ title: 'Cases' }} />
      <Tab.Screen name="Notifications" component={() => <PlaceholderScreen route={{name: 'Notifications'}} />} /> 
      <Tab.Screen name="Settings" component={() => <PlaceholderScreen route={{name: 'Settings'}} />} />
      <Tab.Screen name="Profile" component={AuthScreen} />
    </Tab.Navigator>
  );
};

// Main Stack Navigator for the entire app flow
const AppNavigator = () => {
  const initialRouteName = "Splash";

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="HomeTabs" component={HomeTabs} /> 
      <Stack.Screen name="CaseDetail" component={CaseDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      {/* <Stack.Screen name="GamePlay" component={GamePlayScreen} /> */}
      <Stack.Screen
        name="PdfViewer"
        component={PdfViewerScreen}
        options={{ headerBackTitle: 'Back' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 