import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { useClientOnlyValue } from '../../components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
     <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,     
          headerShown: false,

        }}
      />
        <Tabs.Screen
           name="(invite)"
           options={{
             title: 'invite',
             tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,     
             headerShown: false,
   
           }}
         />
        <Tabs.Screen
           name="(profile)"
           options={{
             title: 'profile',
             tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,     
             headerShown: false,
   
           }}
         />
 
 
    
 
    </Tabs>
  );
}