import React from 'react';
import { StyleSheet } from 'react-native'; // View, Text, Button, SafeAreaView are not directly used in App.js anymore
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import CaseListScreen from './src/screens/CaseListScreen';
import InvestigationDashboardScreen from './src/screens/InvestigationDashboardScreen';

// We will remove these direct engine imports from App.js later, they'll move to the relevant screen.
// import { CaseEngine, mockDeadAirBundle, EngineState } from '@decodecase/case-engine';

// Placeholder definitions for CaseListScreen and InvestigationDashboardScreen are removed.

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CaseList">
        <Stack.Screen name="CaseList" component={CaseListScreen} options={{ title: 'Select a Case' }} />
        <Stack.Screen name="InvestigationDashboard" component={InvestigationDashboardScreen} options={{ title: 'Investigation' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles are not used in App.js directly anymore, they are in individual screen files.
// const styles = StyleSheet.create({ ... });
