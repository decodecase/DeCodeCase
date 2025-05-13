import 'react-native-gesture-handler'; // MUST BE AT THE TOP
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go, in a native build,
// or in Node.js for SSR, App is σημασμενο correctly.
registerRootComponent(App); 