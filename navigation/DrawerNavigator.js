import React, {Component} from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import StackNavigator from "./StackNavigator";
import Profile from "../screens/Profile";
import Logout from "../screens/Logout";
import firebase from "firebase";
import CustomSideBarMenu from "../screens/CustomSideBarMenu";

const Drawer = createDrawerNavigator();

class DrawerNavigator extends Component{
    constructor(props){
        super(props);
        this.state = {
            light_theme: true
        }
    }
    componentDidMount(){
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

    render(){
    return(
        <Drawer.Navigator screenOptions={{headerShown:false}}
                          drawerContentOptions={{
                            activeTintColor: "#e91e63",
                            inactiveTintColor: this.state.light_theme ? "black" : "white",
                            itemStyle: {marginVertical: 5}
                          }}
                          drawerContent={(props)=> <CustomSideBarMenu{...props}/>}>
            <Drawer.Screen name="Tela inicial" component={StackNavigator} options={{unmountOnBlur: true}}/>
            <Drawer.Screen name="Perfil" component={Profile} options={{unmountOnBlur: true}}/>
            <Drawer.Screen name="Logout" component={Logout} options={{unmountOnBlur: true}}/>
        </Drawer.Navigator>
    )
}
}

export default DrawerNavigator;