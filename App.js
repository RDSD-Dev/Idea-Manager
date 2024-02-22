import * as React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ToDoLists from './ToDoLists';
import AddList from './AddList';
import List from './List';
import AddItem from './AddItem';
import UpdateItem from './UpdateItem';

import Notes from './Notes';

import Settings from './Settings';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Nested Navigator Stack
function ToDoListNav(){
  const [listArr, setListArr] = useState([]);

  if(listArr.length <= 0){
    const value = AsyncStorage.getItem('Lists').then((value) => {
      if(!value){
        console.log('Making New Lists Key');
        const listArr = ['rootList1'];
        AsyncStorage.setItem('Lists', JSON.stringify(listArr));
      }
      else{
        if(value != undefined){

          setListArr(JSON.parse(value));
        }
        else{
          console.log("Fail: ", value);
        }
      }
    });
}
else{
  console.log("Lists: ", listArr);
  return (
    <Stack.Navigator >
      <Stack.Screen name="To Do Lists" component={ToDoLists} />
      <Stack.Screen name="Add List" component={AddList} />
      <Stack.Screen name="To Do List" component={List} />
      <Stack.Screen name="Add Item" component={AddItem} />
      <Stack.Screen name="Update Item" component={UpdateItem} />
    </Stack.Navigator>
);
}
}

// Root Navigator Tab 
export default function App() {
  
return(
  <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen name="To Do" component={ToDoListNav} options={{headerShown: false}}/>
      <Tab.Screen name="Notes" component={Notes} options={{headerShown: false}}/>
      <Tab.Screen name="Settings" component={Settings}/>
    </Tab.Navigator>
  </NavigationContainer>
);



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A9A9A9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
