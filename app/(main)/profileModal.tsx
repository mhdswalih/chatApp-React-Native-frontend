import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import * as Icons from "phosphor-react-native";
import Typo from "@/components/Typo";
import { useAuth } from "@/context/authContext";
import { UserDataProps } from "@/type";
import Input from "@/components/Input";
import Button from "@/components/Button";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { updateProfile } from "@/socket/socketEvents";
import { uploadFileCloudinary } from "@/service/imageService";

const ProfileModal = () => {
  const { user, signOut, updateToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserDataProps>({
    name: "",
    email: "",
    avatar: null,
  });

  const onSubmition = async () => {
    const { name, avatar } = userData;
  
    if (!name.trim()) {
      Alert.alert("User", "Please enter your name");
      return;
    }
  
    try {
      setIsLoading(true);
  
      let data: any = { name, avatar };
  
      // Check if avatar needs to be uploaded (new image selected)
      if (avatar && typeof avatar === "object") {
        // Web: has file property
        if (Platform.OS === "web" && avatar.file) {
          const res = await uploadFileCloudinary(avatar.file, "profiles");
          if (!res.success) {
            Alert.alert("User", res.msg);
            setIsLoading(false);
            return;
          }
          data.avatar = res.data; // ✅ string URL only
        }
        // Mobile: has uri property (new image)
        else if (avatar.uri && !avatar.uri.startsWith("http")) {
          const res = await uploadFileCloudinary(avatar, "profiles");
          if (!res.success) {
            Alert.alert("User", res.msg);
            setIsLoading(false);
            return;
          }
          data.avatar = res.data; // ✅ string URL only
        }
        // Existing URL (already uploaded)
        else if (typeof avatar === "string" || (avatar.uri && avatar.uri.startsWith("http"))) {
          data.avatar = typeof avatar === "string" ? avatar : avatar.uri;
        }
      }
  
      updateProfile(data); // socket emit
    } catch (error) {
      console.log("Update profile error:", error);
      Alert.alert("Error", "Failed to update profile");
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    updateProfile(processUpdateProfile);
    return () => {
      updateProfile(processUpdateProfile, true);
    };
  }, []);

  const processUpdateProfile = async (res: any) => {
    setIsLoading(false);
    if (res.success) {
      updateToken(res.data.token);
      router.back();
    } else {
      Alert.alert("User", res.msg);
    }
  };
  useEffect(() => {
    setUserData({
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar,
    });
  }, [user]);

  const handleLogout = async () => {
    router.back();
    await signOut();
  };

  const showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => console.log("Logout cancelled"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => handleLogout(),
        style: "destructive",
      },
    ]);
  };

  const onPickImage = async () => {
    try {
      // Request permissions (mobile only)
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Please grant camera roll permissions");
          return;
        }
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], 
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // For web, expo-image-picker returns a File object in asset.file
        // For mobile, it returns {uri, width, height, etc.}
        if (Platform.OS === "web" && asset.file) {
          // Web: store File object
          setUserData({ ...userData, avatar: { file: asset.file, uri: asset.uri } });
        } else {
          // Mobile: store asset object with uri
          setUserData({ ...userData, avatar: asset });
        }
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title={"Update Profile"}
          leftIcon={
            Platform.OS === "android" && <BackButton color={colors.black} />
          }
          style={{ marginVertical: spacingY._15 }}
        />

        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.avatarContainer}>
            <Avatar uri={userData.avatar} size={170}  />
            <TouchableOpacity style={styles.editIcone} onPress={onPickImage}>
              <Icons.PencilIcon
                size={verticalScale(20)}
                color={colors.neutral800}
              />
            </TouchableOpacity>
          </View>

          <View style={{ gap: spacingY._20 }}>
            <View style={styles.inputContainer}>
              <Typo style={{ paddingLeft: spacingX._10 }}>Email</Typo>
              <Input
                value={userData.email}
                containerStyle={{
                  borderColor: colors.neutral350,
                  paddingLeft: spacingX._20,
                  backgroundColor: colors.neutral300,
                }}
                editable={false}
                onChangeText={(value) =>
                  setUserData({ ...userData, email: value })
                }
              />

              <Typo style={{ paddingLeft: spacingX._10 }}>Name</Typo>
              <Input
                value={userData.name}
                containerStyle={{
                  borderColor: colors.neutral350,
                  paddingLeft: spacingX._20,
                  backgroundColor: colors.neutral300,
                }}
                onChangeText={(value) =>
                  setUserData({ ...userData, name: value })
                }
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {!isLoading && (
          <Button
            style={{
              backgroundColor: colors.rose,
              height: verticalScale(56),
              width: verticalScale(56),
            }}
            onPress={showLogoutAlert}
          >
            <Icons.SignOutIcon
              size={verticalScale(30)}
              color={colors.white}
              weight="bold"
            />
          </Button>
        )}

        <Button style={{ flex: 1 }} onPress={onSubmition} loading={isLoading}>
          <Typo color={colors.black} fontWeight={"700"}>
            Update
          </Typo>
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral200,
    marginBottom: spacingY._10,
    borderTopWidth: 1,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  editIcone: {
    position: "absolute",
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    textShadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },
  inputContainer: {
    gap: spacingY._7,
  },
});
