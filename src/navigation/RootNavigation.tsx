/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';

import {nav} from './navName';
import LoginScreen from '../screen/LoginScreen';
import HomeScreen from '../screen/HomeScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import AccountScreen from '../screen/AccountScreen';
import CropImageScreen from '../screen/CropImageScreen';
import SettingScreen from '../screen/SettingScreen';
import CameraScreen from '../screen/CameraScreen';
import {AppDispatch, RootState} from '../redux/store';
import {restoreOldData} from '../util/migrateOldPersist';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    restoreOldData(dispatch);
  }, []);
  return (
    <Stack.Navigator
      initialRouteName={nav.login}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name={nav.login} component={LoginScreen} />
    </Stack.Navigator>
  );
};

const HomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={nav.home} component={HomeScreen} />
      <Stack.Screen name={nav.accountInfo} component={AccountScreen} />
      <Stack.Screen name={nav.crop} component={CropImageScreen} />
      <Stack.Screen name={nav.setting} component={SettingScreen} />
      <Stack.Screen name={nav.camera} component={CameraScreen} />
    </Stack.Navigator>
  );
};

const RootNavigation = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user);

  return (
    <>
      <NavigationContainer>
        {isLoggedIn.user ? <HomeNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </>
  );
};

export default RootNavigation;
