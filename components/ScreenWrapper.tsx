import { Dimensions, ImageBackground, Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ScreenWrapperProps } from '@/type'
import { colors } from '@/constants/theme';

const { height } =  Dimensions.get('window');


const ScreenWrapper = ({
    style,
    children,
    showPattern = false,
    isModal = false,
    bgOpacity = 1
} : ScreenWrapperProps) => {
    
    let paddingTop = Platform.OS == "ios" ? height * 0.06 : 40;
    let paddingBottom = 0;

     if(isModal){
        paddingTop = Platform.OS == "ios" ? height * 0.02 : 45;
        paddingBottom = height * 0.02
     }
  return (
    <ImageBackground 
      resizeMode={showPattern ? "repeat" : "cover"}
      style={[
        styles.background,
        { backgroundColor: isModal ? colors.white : colors.neutral900 },
      ]}
      imageStyle={[
        styles.pattern,
        { opacity: showPattern ? bgOpacity : 0 },
      ]}
      source={require('../assets/images/bgPattern.png')}
    >
      <View
    style={[
        {
            paddingTop,
            paddingBottom,
            flex : 1
        },
        style
    ]}
      >
        {children}
      </View>
    </ImageBackground>
  )
}

export default ScreenWrapper

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  pattern: {
    width: '100%',
    height: '100%',
  },
})