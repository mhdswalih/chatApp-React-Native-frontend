import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { AvatarProps } from "@/type";
import { verticalScale } from "@/utils/styling";
import { colors, radius } from "@/constants/theme";
import { Image } from "expo-image";
import { getAvatar } from "@/service/imageService";

const Avatar = ({ uri, size = 40, style, isGroup = false }: AvatarProps) => {
  return (
    <View
      style={[
        styles.avatar,
        { height: verticalScale(size), width: verticalScale(size) },
      ]}
    >
      <Image 
       style={{flex: 1}}
       source={getAvatar(uri,isGroup)}
       contentFit="cover"
       transition={100}
      />
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral200,
    height: verticalScale(47),
    width: verticalScale(47),
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral100,
    overflow: "hidden",
  },
});
