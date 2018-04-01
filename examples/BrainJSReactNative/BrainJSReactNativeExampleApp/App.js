import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity
} from 'react-native';
import classify from './Services/classify-service.js'
import Header from './Components/header.js'

export default class App extends Component {

  constructor() {
    super()

    this.state = {
      DrakeResult:"",
      EminemResult:"",
      DrakeResultColor:"lightgreen",
      EminemResultColor:"red",
      resultShow:0
   }
  }

  ClassifyText = () => {

    let drakesScore = classify.classifyLyrics(this.state.lyrics)
    let eminmeScore = classify.classifyLyrics(this.state.lyrics)

    if(drakesScore === NaN || drakesScore === null || eminmeScore === NaN || eminmeScore === null) {
      this.setState({
        DrakeResult:"Unable to determine confidence level.",
        EminemResult:"Unable to determine confidence level.",
        resultShow:100
      })
      return;
    }

    if(drakesScore > eminmeScore) {
      this.setState({
        DrakeResultColor:'lightgreen',
        EminemResultColor:'red'
      })
    } else {
      this.setState({
        DrakeResultColor:'red',
        EminemResultColor:'lightgreen'
      })
    }

    this.setState({
      DrakeResult:classify.classifyLyrics(this.state.lyrics).Drake,
      EminemResult:classify.classifyLyrics(this.state.lyrics).Eminem,
      resultShow:100
    })
  }

  render() {
    return (
      <View style={styles.container}>
      <Header />
      <Text style={styles.inputLyricsTextLable}>Input Lyrics:</Text>
      <TextInput
        style={{height: 150, borderColor: '#F3DF4A', borderWidth: 2}}
        onChangeText={(lyrics) => this.setState({lyrics})}
        multiline = {true}
      />
      <TouchableOpacity
          style={styles.classifyBtnStyle}
          onPress={() => this.ClassifyText()}
          underlayColor='#F3DF4A'>
          <Text style={styles.classifyTextStyle}>Classify</Text>
      </TouchableOpacity>

      <Text style={{
        fontSize:16,
        fontWeight:"bold",
        textAlign:"center",
        marginTop:"10%",
        marginTop:50,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:this.state.DrakeResultColor,
        opacity:this.state.resultShow
      }}>
        Drake: {this.state.DrakeResult}
      </Text>
      <Text style={{
        fontSize:16,
        fontWeight:"bold",
        textAlign:"center",
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:this.state.EminemResultColor,
        opacity:this.state.resultShow
      }}>
        Eminem: {this.state.EminemResult}
      </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  inputLyricsTextLable: {
    fontWeight:"bold",
    fontSize:16,
    textAlign:"center",
    marginTop:"35%",
    marginBottom:"5%"
  },
  classifyBtnStyle: {
    marginRight:40,
    marginLeft:40,
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor:'#F3DF4A',
    borderRadius:10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  classifyTextStyle: {
    fontSize:16,
    fontWeight:"bold",
    textAlign:"center"
  }
});
