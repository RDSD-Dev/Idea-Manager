import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View } from 'react-native';
import { Directory } from './Directory';

export class Task extends Directory {
    constructor(name, order, parentKey, color){
        super(name, order, parentKey, color);
        this.name = name;
        this.order = order;
        this.parentKey = parentKey;
        this.color = color;
        
        this.isComplete = false;
    }

    toggleCompletion(){
        this.isComplete = !this.isComplete;
        this.saveAsync();
    }

    test(){
        return 'Succsess';
    }
}