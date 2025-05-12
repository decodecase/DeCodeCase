import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // For actual login, not just email sign-up
  const [isLogin, setIsLogin] = useState(false); // To toggle between Login and Sign Up

  const handleContinue = () => {
    // Basic email validation
    if (!email.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    console.log('Email for sign up:', email);
    // Here you would typically call an API to create an account or log in
    alert('Account action (placeholder) for ' + email);
    // Navigate to Home screen or appropriate next screen
    navigation.replace('HomeTabs'); // Or wherever your main app flow starts post-auth
  };

  const handleSocialLogin = (provider) => {
    console.log(`Continue with ${provider}`);
    alert(`Login with ${provider} (Placeholder)`);
    // Navigate to Home screen
    navigation.replace('HomeTabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DeCodeCase</Text>
      <Text style={styles.subtitle}>
        {isLogin ? 'Log in to your account' : 'Enter your email to sign up for this app'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="email@domain.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      )}

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>{isLogin ? 'Login' : 'Continue'}</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or</Text>

      <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
        {/* Add Google icon here later */}
        <Text style={styles.socialButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
        {/* Add Apple icon here later */}
        <Text style={styles.socialButtonText}>Continue with Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleAuthMode}>
        <Text style={styles.toggleAuthText}>
          {isLogin ? 'Don\'t have an account? Sign Up' : 'Already have an account? Log In'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.termsText}>
        By clicking continue, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    marginVertical: 15,
    color: '#aaa',
  },
  socialButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  socialButtonText: {
    color: '#333',
    fontSize: 16,
    marginLeft: 10, // Space for icon
  },
  toggleAuthMode: {
      marginTop: 15,
  },
  toggleAuthText: {
      color: '#5D3FD3',
      fontSize: 14,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20, // Adjust for different platforms
    left: 20,
    right: 20,
  },
});

export default AuthScreen; 