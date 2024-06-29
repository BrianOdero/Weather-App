import { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ListRenderItem,
  ImageBackground
 } from "react-native";
import * as Location from 'expo-location';
import dayjs from "dayjs";
import { Stack } from "expo-router";
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';


const BASE_URL = `https://api.openweathermap.org/data/2.5`;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const bgImage = 'https://i.pinimg.com/736x/3f/b4/c9/3fb4c9361e05480cdb071104d63f0381.jpg'

// Types for weather and forecast data
type Weather = {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  weather: [
    {
      id: string,
      main: string,
      description: string,
      icon: string
    }
  ],
};

type ForecastItem = {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  dt: number;
};

type WeatherForecast = {
  list: ForecastItem[];//only asisting in setting the use state
};

export default function Index() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  //fetch current weather data
  const fetchWeather = async () => {
    if (!location) return;

    //will get current latitude and longitude 
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;

    const results = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&cnt=5&appid=${API_KEY}&units=metric`);
    const data = await results.json();
    setWeather(data);
  };

  //fetching forecast data
  const fetchForecast = async () => {
    if (!location) return;

    const lat = location.coords.latitude;
    const lon = location.coords.longitude;

    const results = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const data = await results.json();
    setForecast(data);
  };

  //useEffect to grant the location permission
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  //will trigger the get weather and forecast functions once the location changes
  useEffect(() => {
    if (location) {
      fetchWeather();
      fetchForecast();
    }
  }, [location]);

  if (!weather || !forecast) {
    return <ActivityIndicator size={"large"} />;
  }

  //function to render the content in the flatlist
  const ForecastItem: ListRenderItem<ForecastItem> = ({ item }) => (
    <BlurView intensity={40} 
      style={{
      backgroundColor: 'transparent',
      overflow: 'hidden',
      aspectRatio: 10/16,
      padding: 10,
      borderRadius: 10,
      borderColor:'darkgray',
      borderWidth: 0.5,
      alignItems: 'center',
      justifyContent: 'center'}} 
      >
      <Text style={styles.temps} >{Math.round(item.main.temp)}°C</Text>
      <Text style={styles.date} >{dayjs(item.dt*1000).format('ddd ha')}</Text>
    </BlurView>
  );

  return (
    <ImageBackground source={{uri: bgImage }} style={styles.container}>
      <View
      style={{...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',//will darken the background
      }}
      />
    <Stack.Screen options={{headerShown: false}}/>

      <View style={{flex: 1,alignItems: 'center',justifyContent: 'center'}} >
        
        <LottieView 
        source={//confirming the weather type to show appropriate icon
          weather.weather[0].main === 'Rain' ?
          require('../assets/lottie/Animation - 1719694074077.json')
          :require('../assets/lottie/sunny.json')
        }
        style={{
          width: 200,
          aspectRatio: 1,
        }}
        loop
        autoPlay
        />

        <Text style={styles.location}>{weather.name}</Text>
        <Text style={styles.temp}>{Math.floor(weather.main.temp)}°C</Text>
        <Text style={styles.location} >{weather.weather[0].main} weather</Text>
        
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{flexGrow: 0,height: 150}}//positioning it at the bottom of the screen
        contentContainerStyle={{gap: 7,height: 150,padding:10}}
        data={forecast.list}
        renderItem={ForecastItem}//declared a function to display the data
      />
      
      
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  location: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  temp: {
    fontSize: 70,
    color: 'white',
    fontWeight: '900'
  },
  temps: {
    color: 'lightgray',
    fontWeight: 'bold',
    fontSize: 30,
  },
  date: {
    color: 'lightgray',
    fontSize: 16,
  }


});
