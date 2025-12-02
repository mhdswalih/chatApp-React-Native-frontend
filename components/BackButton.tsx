import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { colors } from '@/constants/theme'
import { BackButtonProps } from '@/type'
import { CaretLeftIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { verticalScale } from '@/utils/styling'
const router = useRouter()
const BackButton = ({
    style,
    iconSize = 26,
    color = colors.white
}:BackButtonProps) => {
  return (
    <TouchableOpacity onPress={() => router.back()} style={[styles.button,style]}>
     <CaretLeftIcon size={verticalScale(iconSize)} color={color} weight='bold' />
    </TouchableOpacity>
  )
}

export default BackButton

const styles = StyleSheet.create({
    button : {}
})