import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View } from 'react-native';
import { Directory } from './Directory';

export class Task extends Directory {
    constructor(name, order, parent, color){
        super(name, order, parent, color);
        this.name = name;
        this.order = order;
        this.parent = parent;
        this.color = color;

        this.isOpen = true;
        this.isComplete = false;
        this.saveAsync();
    }

    toggleCompletion(){
        this.isComplete = !this.isComplete;
        this.saveAsync();
    }
}