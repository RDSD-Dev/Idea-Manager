import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Category(props) { // title, color
  const [images, setImages] = useState([]);
    const table = props.route.params.table;
    const [note, setNote] = useState(undefined);
    const navigation = useNavigation();


    return (
      <View style={{}}>
        <Text>{props.title} Header</Text>
        
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#A9A9A9',
      alignItems: 'center',
      justifyContent: 'center',
    },

    TextInput: {
      backgroundColor: '#808080',
      color: '#000000',
     
      
    }


  });
  