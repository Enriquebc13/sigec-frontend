import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text } from "react-native";

export default function MyRequestsView(){
    return(
    <LinearGradient
        colors={["#5E35B1", "#1A0B2E", "#000000"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientContainer}
      >

        <Text style={styles.title}>Mi Lista de solicitudes</Text>
      </LinearGradient>
    )
}


const styles = StyleSheet.create({
    gradientContainer: {
        flex:1,  
        alignItems:"center"      
    },
    title: {
        color:"#ffff",
        fontWeight:"bold",
        fontSize:20,
        
    }
})