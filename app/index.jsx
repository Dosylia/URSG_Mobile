import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, ScrollView } from "react-native";
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from "../components";

import { images } from "../constants";

export default function App() {
  return (
    <SafeAreaView className="bg-darkgrey h-full">
      <ScrollView contentContainerStyle={{
          height: "100%",
        }}>
        <View className="w-full flex justify-normal items-center h-full px-4">
          <Image 
            source={images.logoWhite}
            className="w-[150px] h-[100px] mt-5"
            resizeMode='contain'
          />

          <Image 
            source={images.ahri}
            className="max-w-[380px] w-full h-[300px] rounded-md"
            resizeMode='contain'
          />

          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">
              Find your perfect {"\n"} 
              soulmate with {' '}
              <Text className="text-mainred">URSG</Text>
            </Text>
          </View>

          <Text className="text-center text-white mt-5 font-pregular mb-5">
            Level up your game with your future match
          </Text>

          <CustomButton 
          title="Join with google"
          handlePress={() => router.push("/basic-info")} // Add google handling function here and once done finish with router.push("/basic-info"), Reset page with error otherwise or new page?
          containerStyles ="w-full mt-7"
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor='#161622' style='light' />
    </SafeAreaView>
  );
}

