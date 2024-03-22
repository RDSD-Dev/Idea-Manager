import { StyleSheet, Text, View, TextInput, Button, ScrollView, Alert, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

import Category from './Category';

export default function HomePage(props) {
  const navigation = useNavigation();
  const [allCategories, setAllCategories] = useState([]); // Stores HomePageCategories from AsyncStorage
  
  
  if(allCategories == null || allCategories.length <= 0){
    const value = AsyncStorage.getItem('HomePageCategories').then((value) => {
        if(!value){
            // New key made
          console.log('Making New Lists Key');
          const temArr = [];
          AsyncStorage.setItem('HomePageCategories', JSON.stringify(temArr));
          setAllCategories(JSON.parse(temArr));
        }
        else{
            // Save Categories
          if(value != undefined){
            setAllCategories(JSON.parse(value));
          }
        }
      });
  }

  const displayCategories = () => {
    return allCategories.map(title => {
        return(
            <Category category={title} color={title.color}/>
        );
    });
  }

    return(
        <ScrollView>
            <Text>Header</Text>
            <FlatList 
              data={}
              renderItem={() => {}}
            />
            {displayCategories()}
        </ScrollView>
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
  