import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Focus } from './src/features/focus/Focus';
import { FocusHistory } from './src/features/focus/FocusHistory';
import { Timer } from './src/features/timer/Timer';
import { colors } from './src/utils/colors';
import { spacing } from './src/utils/sizes';
import AsyncStorage from '@react-native-async-storage/async-storage'


const STATUSES = {
  COMPLETE: 1,
  CANCELLED: 2,
};

export default function App() {
  const [focusSubject, setFocusSubject] = useState(null);
  const [focusHistory, setFocusHistory] = useState([]);

  const addFocusHistorySubjectWithStatus = (subject, status) => {
    setFocusHistory([...focusHistory, { key: String(focusHistory.length+1), subject, status }]);
  };
  // previously focushistory was a list of singletons (subject), now it is a list of pairs ({subject, status}).

  const onClear = () => {
    setFocusHistory([])
  }

  const saveFocusHistory = async () => {
    try {
      await AsyncStorage.setItem("focusHistory", JSON.stringify(focusHistory));
    } catch(e){
      console.log(e);
    }
  };
  
  const loadFocusHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('focusHistory');
      if (history && JSON.parse(history).length) {
        setFocusHistory(JSON.parse(history));
      }
    } catch (e){
      console.log(e);
    }
  }

useEffect(()=> {
  loadFocusHistory
}, [])
// this is the trick to run it on mount

  useEffect(() => {
    saveFocusHistory();
  }, [focusHistory])

  useEffect(() => {
    if (focusSubject) {
      setFocusHistory([...focusHistory, focusSubject]);
    }
  }, [focusSubject]);
  //use effect is this thing that runs a function everytime the second argument chanages. in this case, this second argument is focus subject. now when focus subject changes we update the list that is focusHistory. Basically appending it. and what the shit is that appending syntax. This useEffect thing which is a lifecycle function is quite sick tho. 

  return (
    <View style={styles.container}>
      {focusSubject ? (
        <Timer
          focusSubject={focusSubject}
          onTimerEnd={() => {
            addFocusHistorySubjectWithStatus(focusSubject, STATUSES.COMPLETE);
            setFocusSubject(null);
          }}
          clearSubject={() => {
            setFocusSubject(null);
            addFocusHistorySubjectWithStatus(focusSubject, STATUSES.CANCELLED);
          }}
        />
      ) : (
        <View style = {{flex:1}}>
        <Focus addSubject={setFocusSubject} />
        <FocusHistory focusHistory = {focusHistory} onClear = {onClear}/>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cambridgeBlue,
    paddingTop: Platform.OS === 'ios' ? spacing.md : spacing.lg,
  },
});
