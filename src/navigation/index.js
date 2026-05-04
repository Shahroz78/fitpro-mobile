import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SIZES } from '../theme';

// Auth screens
import WelcomeScreen    from '../screens/Auth/WelcomeScreen';
import LoginScreen      from '../screens/Auth/LoginScreen';
import RegisterScreen   from '../screens/Auth/RegisterScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';

// Main screens
import HomeScreen          from '../screens/Main/HomeScreen';
import WorkoutsScreen      from '../screens/Main/WorkoutsScreen';
import WorkoutDetailScreen from '../screens/Main/WorkoutDetailScreen';
import LogActivityScreen   from '../screens/Main/LogActivityScreen';
import ProgressScreen      from '../screens/Main/ProgressScreen';
import ProfileScreen       from '../screens/Main/ProfileScreen';

// New feature screens
import ActiveWorkoutScreen   from '../screens/Main/ActiveWorkoutScreen';
import FitnessSettingsScreen from '../screens/Main/FitnessSettingsScreen';
import StatsScreen           from '../screens/Main/StatsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_ICONS = {
  Home:      ['home',        'home-outline'       ],
  Workouts:  ['barbell',     'barbell-outline'    ],
  Log:       ['add-circle',  'add-circle-outline' ],
  Progress:  ['trending-up', 'trending-up-outline'],
  Profile:   ['person',      'person-outline'     ],
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor:  COLORS.border,
          borderTopWidth:  1,
          height:          72,
          paddingBottom:   10,
          paddingTop:      8,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.semiBold,
          fontSize:   SIZES.xs,
          marginTop:  2,
        },
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused, color }) => {
          const [active, inactive] = TAB_ICONS[route.name] || ['help', 'help-outline'];
          return <Ionicons name={focused ? active : inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Log"      component={LogActivityScreen} options={{ tabBarLabel: 'Log' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome"    component={WelcomeScreen} />
      <Stack.Screen name="Login"      component={LoginScreen} />
      <Stack.Screen name="Register"   component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding"      component={OnboardingScreen} />
      <Stack.Screen name="Main"            component={MainTabs} />
      <Stack.Screen name="WorkoutDetail"   component={WorkoutDetailScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="ActiveWorkout"   component={ActiveWorkoutScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: false }} />
      <Stack.Screen name="Stats"           component={StatsScreen}
        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="FitnessSettings" component={FitnessSettingsScreen}
        options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigation() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}