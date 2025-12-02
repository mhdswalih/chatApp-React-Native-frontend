import { StyleSheet, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Animated, { FadeIn } from 'react-native-reanimated'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'

const Welcome = () => {
  const router = useRouter()
  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <View style={styles.container}>
      <View style={{alignItems : "center"}}>
          <Typo color={colors.white} size={40} fontWeight={"900"}>
          Bubbly
          </Typo>
          </View>
          <Animated.Image
          entering={FadeIn.duration(700).springify()}
          source={require("../../assets/images/welcome.png")}
          style={styles.welcomeImage}
          resizeMode={"contain"} />
          <View>
            <Typo color={colors.white} size={33} 
            fontWeight={"800"}>
              Stay Connected
            </Typo>
            <Typo color={colors.white} size={33} 
            fontWeight={"800"}>
              With your Family
            </Typo>
            <Typo color={colors.white} size={33} 
            fontWeight={"800"}>
              and Frinds
            </Typo>
          </View>
          <Button onPress={() => router.push("/(auth)/Register")} style={{backgroundColor : colors.white}}>
            <Typo size={23} fontWeight={"bold"}>Get Started</Typo>
          </Button>
        </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container : {
    flex : 1,
    justifyContent : "space-around",
    paddingHorizontal : spacingX._20,
    marginVertical : spacingY._10,
  },
  background : {
    flex : 1,
    backgroundColor : colors.neutral900,
  },
  welcomeImage : {
    height : verticalScale(300),
    aspectRatio : 1,
    alignSelf : "center"
  }
})