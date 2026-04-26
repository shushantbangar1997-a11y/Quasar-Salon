import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './src/firebase';
import { CartProvider } from './src/CartContext';
import { BookingsProvider } from './src/BookingsContext';
import { AdminProvider } from './src/AdminContext';
import { StaffProvider } from './src/StaffContext';
import { RootStackParamList, TabParamList } from './src/navigation';
import FloatingTabBar from './src/components/FloatingTabBar';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import CartScreen from './src/screens/CartScreen';
import BookingScreen from './src/screens/BookingScreen';
import BookingSuccessScreen from './src/screens/BookingSuccessScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import OTPScreen from './src/screens/OTPScreen';
import SplashScreen from './src/screens/SplashScreen';
import AdminScreen from './src/screens/AdminScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { paddingBottom: 88 } }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const triedAuth = useRef(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!auth || triedAuth.current) return;
    triedAuth.current = true;
    signInAnonymously(auth).catch(() => {});
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AdminProvider>
    <StaffProvider>
    <BookingsProvider>
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MainTabs">
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
    </BookingsProvider>
    </StaffProvider>
    </AdminProvider>
  );
}
