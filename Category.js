import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Category(props) {
  const [images, setImages] = useState([]);
    const table = props.route.params.table;
    const [note, setNote] = useState(undefined);
    const navigation = useNavigation();


    return (
      <ScrollView style={{}}>
        <Button title="Pick an image from camera roll" onPress={pickImage} />
        {displayPics()}
        <StatusBar />
        <TextInput style={[styles.TextInput]} value={note} multiline={true} onChangeText={setNote}/>
        
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

    TextInput: {
      backgroundColor: '#808080',
      color: '#000000',
     
      
    }


  });
  