import React, { Component } from "react";
import {    View,    Text,    StyleSheet,    SafeAreaView,    Platform,    StatusBar,    Image,    ScrollView,    Dimensions,
TouchableOpacity} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";

import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import * as Speech from "expo-speech";
import firebase from "firebase";
import StoryCard from "./StoryCard";

let customFonts = {
  "Bubblegum-Sans": require("../assets/fonts/BubblegumSans-Regular.ttf")
};

export default class StoryScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fontsLoaded: false,
            speakerColor: "gray",
            speakerIcon: "volume-high-outline",
            light_theme: true,
            story: this.props.route.params.story,
            likes: this.props.route.params.story.likes,
            story_id: this.props.route.params.storyId,
            is_liked: false
        };
    }

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
    this.fetchUser();
  }

  fetchUser = () => {
    let theme;
    firebase
      .database()
      .ref("/users/" + firebase.auth().currentUser.uid)
      .on("value", snapshot => {
        theme = snapshot.val().current_theme;
        this.setState({ light_theme: theme === "light" });
      });
  };

  async initiateTTS(title,author,story,moral){
      const current_color = this.state.speakerColor;
      this.setState({
      speakerColor: current_color === "gray" ? "#ee8219" : "gray" 
      })
      if(current_color === "gray"){
        Speech.speak(`${title}, escrito por ${author}`);
        Speech.speak(story);
        Speech.speak("A moral da história é!");
        Speech.speak(moral, {onDone:()=>this.setState({speakerColor: "gray"})})
      } else {
        Speech.stop();
      }
    }
  
    likeAction = () => {
      if(this.state.is_liked){
        firebase.database()
                .ref("posts")
                .child(this.state.story_id)
                .child("likes")
                .set(firebase.database.ServerValue.increment(-1))
                this.setState({
                  likes: (this.state.likes -= 1),
                  is_liked: false
                })
      } else {
        firebase.database()
                .ref("posts")
                .child(this.state.story_id)
                .child("likes")
                .set(firebase.database.ServerValue.increment(1))
                this.setState({
                  likes: (this.state.likes += 1),
                  is_liked: true
                })
      }
    }

render() {
        if (!this.props.route.params) {
            this.props.navigation.navigate("Home");
        } else if (!this.state.fontsLoaded) {
            SplashScreen.hideAsync();
        } else {
          let preview_images = {
        image_1: require("../assets/story_image_1.png"),
        image_2: require("../assets/story_image_2.png"),
        image_3: require("../assets/story_image_3.png"),
        image_4: require("../assets/story_image_4.png"),
        image_5: require("../assets/story_image_5.png")
      };
        return (
        <View style={this.state.light_theme ? styles.containerLight : styles.container}>
         <SafeAreaView style={styles.droidSafeArea} />
            <View style={styles.appTitle}>
              <View style={styles.appIcon}>
                <Image source={require("../assets/logo.png")}
                        style={styles.iconImage}></Image>
              </View>
              <View style={styles.appTitleTextContainer}>
              <Text style={this.state.light_theme ? styles.appTitleTextLight : styles.appTitleText}>
               Storygram
              </Text>
            </View>
          </View>
          <View style={styles.storyContainer}>
            <ScrollView style={this.state.light_theme ? styles.storyCardLight : styles.storyCard}>
              <Image source={preview_images[this.state.story.preview_image]}
                     style={styles.image}></Image>
              <View style={styles.dataContainer}>
                <View style={styles.titleTextContainer}>
                  <Text style={this.state.light_theme ? styles.storyTitleTextLight : styles.storyTitleText}>
                    {this.state.story.title}
                  </Text>
                  <Text style={this.state.light_theme ? styles.storyAuthorTextLight : styles.storyAuthorText}>
                    {this.state.story.author}
                  </Text>
                  <Text
                    style={this.state.light_theme ? styles.storyAuthorTextLight : styles.storyAuthorText}>
                    {this.state.story.created_on}
                  </Text>
                </View>
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      this.initiateTTS(
                        this.state.story.title,
                        this.state.story.author,
                        this.state.story.story,
                        this.state.story.moral,
                      )
                    }
                  >
                    <Ionicons
                      name={this.state.speakerIcon}
                      size={RFValue(30)}
                      color={this.state.speakerColor}
                      style={{ margin: RFValue(15) }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.storyTextContainer}>
                <Text
                  style={this.state.light_theme ? styles.storyTextLight : styles.storyText}>
                  {this.state.story.story}
                </Text>
                <Text style={this.state.light_theme ? styles.moralTextLight : styles.moralText}>
                  Moral da História - {this.state.story.moral}
                </Text>
              </View>
              <View style={styles.actionContainer}>
                <TouchableOpacity onPress={()=> this.likeAction()}
                                  style={this.state.is_liked ? styles.likeButtonLiked : styles.likeButtonDisliked}>
                  <Ionicons
                    name={"heart"}
                    size={RFValue(30)}
                    color={this.state.light_theme ? "#15193c" : "white"}
                  />
                  <Text style={this.state.light_theme ? styles.likeTextLight : styles.likeText}>{this.state.likes}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15193c"
  },
  containerLight: {
    flex: 1,
    backgroundColor: "white"
  },
  droidSafeArea: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : RFValue(35)
  },
  appTitle: {
    flex: 0.07,
    flexDirection: "row"
  },
  appIcon: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center"
  },
  iconImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  },
  appTitleTextContainer: {
    flex: 0.7,
    justifyContent: "center"
  },
  appTitleText: {
    color: "white",
    fontSize: RFValue(20),
    fontFamily: "Bubblegum-Sans"
  },
  appTitleTextLight: {
    color: "#15193c",
    fontSize: RFValue(20),
    fontFamily: "Bubblegum-Sans"
  },
  storyContainer: {
    flex: 1
  },
  storyCard: {
    margin: RFValue(20),
    backgroundColor: "#2f345d",
    borderRadius: RFValue(20)
  },
  storyCardLight: {
    margin: RFValue(20),
    backgroundColor: "white",
    borderRadius: RFValue(20),
    shadowColor: "rgb(0, 0, 0)",
    shadowOffset: {
      width: 3,
      height: 3
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2
  },
  image: {
    width: "100%",
    alignSelf: "center",
    height: RFValue(200),
    borderTopLeftRadius: RFValue(20),
    borderTopRightRadius: RFValue(20),
    resizeMode: "contain"
  },
  dataContainer: {
    flexDirection: "row",
    padding: RFValue(20)
  },
  titleTextContainer: {
    flex: 0.8
  },
  storyTitleText: {
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(25),
    color: "white"
  },
  storyTitleTextLight: {
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(25),
    color: "#15193c"
  },
  storyAuthorText: {
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(18),
    color: "white"
  },
  storyAuthorTextLight: {
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(18),
    color: "#15193c"
  },
  iconContainer: {
    flex: 0.2
  },
  storyTextContainer: {
    padding: RFValue(20)
  },
  storyText: {
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(15),
    color: "white"
  },
  storyTextLight: {
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(15),
    color: "#15193c"
  },
  moralText: {
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(20),
    color: "white"
  },
  moralTextLight: {
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(20),
    color: "#15193c"
  },
  actionContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: RFValue(10)
  },
  likeButtonLiked: {
    width: RFValue(160),
    height: RFValue(40),
    flexDirection: "row",
    backgroundColor: "#eb3948",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(30)
  },
  likeButtonDisliked: {
    width: RFValue(160),
    height: RFValue(40),
    flexDirection: "row",
    borderColor: "#eb3948",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(30)
  },
  likeText: {
    color: "#f2f2f2",
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(25),
    marginLeft: RFValue(5)
  },
  likeTextLight: {
    color: "#15193c",
    fontFamily: "Bubblegum-Sans",
    fontSize: RFValue(25),
    marginLeft: RFValue(5)
  }
});