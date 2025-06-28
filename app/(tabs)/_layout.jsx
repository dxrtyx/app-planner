import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {

  return (
    <Tabs screenOptions={{
      headerShown:false,
      tabBarActiveTintColor: Colors.Green,
      tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 5,
          fontFamily: 'manrope',
        }
      }}>
      <Tabs.Screen name='home-page'
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({color}) => <MaterialIcons
            name="edit-note"
            size={26}
            color="black" />
        }}
      />
      <Tabs.Screen name='calendar'
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({color}) => <MaterialIcons
            name="event-note" 
            size={26} 
            color="black" />
        }}
      />

      <Tabs.Screen name='profile'
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => <MaterialIcons
          name="person-outline"
          size={30}
          color="black" />
        }}
      />
    </Tabs>
  )
}