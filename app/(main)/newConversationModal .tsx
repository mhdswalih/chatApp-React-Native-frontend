import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import * as ImagePicker from "expo-image-picker";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { useAuth } from "@/context/authContext";
import Button from "@/components/Button";
import { getContacts, newConversation } from "@/socket/socketEvents";
import { uploadFileCloudinary } from "@/service/imageService";

const NewConversationModal = () => {
  const { isGroup } = useLocalSearchParams();
  const isGroupMod = isGroup == "1";
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const { user: currentUser } = useAuth();

  const toggleParticipant = (user: any) => {
    setSelectedParticipants((prev: any) => {
      if (prev.includes(user.id)) {
        return prev.filter((id: string) => id !== user.id);
      }
      return [...prev, user.id];
    });
  };

  const onSelectUser = (user: any) => {
    if (!currentUser) {
      Alert.alert("Authentication", "Please login to start a conversation");
      return;
    }
    if (isGroupMod) {
      toggleParticipant(user);
    } else {
     newConversation({
      type : 'direct',
      participants : [currentUser.id,user.id]
     })
    }
  };
  useEffect(() => {
    getContacts(processGetContacts);
    newConversation(processNewConversation);
    getContacts(null);
    return () => {
      getContacts(processGetContacts, true);
    newConversation(processNewConversation,true);
    };
  }, []);

  const processGetContacts = (res: any) => {
    console.log("got contacts" + res);
    if (res.success) {
      setContacts(res.data);
    }
  };

  const processNewConversation = (res : any) => {
    console.log("new conversation result :" + res);
    setIsLoading(false)
    if (res.success) {
      router.back(),
      router.push({
        pathname : "/(main)/conversation",
        params : {
          id : res.data._id,
          name : res.data.name,
          avatar :res.data.avatar,
          type : res.data.type,
          participants : JSON.stringify(res.data.participants)
        }
      })
    }else {
      console.log("Error fetch/chating conversation",res.msg);
      Alert.alert('Error',res.msg)
      
    }
  }
  const onPickImage = async () => {
    try {
      // Request permissions (mobile only)
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Please grant camera roll permissions"
          );
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
        // Only store the 'uri' field, since groupAvatar expects { uri: string }
        setGroupAvatar({ uri: asset.uri });
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length < 2 || !currentUser) return;
    setIsLoading(true)
    try {
      let avatar = null
       if(groupAvatar){
          const uploadResult = await uploadFileCloudinary(
            groupAvatar ,"group-avatar"
          )
          if(uploadResult.success) avatar = uploadResult.data
       }
       newConversation({
        type : "group",
        name: groupName.trim(),
        participants : [currentUser.id,...selectedParticipants],
        avatar
       })
    } catch (error : any) {
      console.log("Error creating group :",error);
      Alert.alert("Error",error.message)      
    }finally{
      setIsLoading(false)
    }
  };

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title={isGroupMod ? "New Group" : "Select User"}
          leftIcon={<BackButton color={colors.black} />}
        />
        {isGroupMod && (
          <View style={styles.groupinfocontainer}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={onPickImage}>
                <Avatar
                  uri={groupAvatar?.uri || null}
                  size={100}
                  isGroup={true}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.groupNameContainer}>
              <Input
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>
          </View>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contactList}
        >
          {contacts.map((user: any, index: any) => {
            const isSelected = selectedParticipants.includes(user.id);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.contactRow, isSelected && styles.selectdContact]}
                onPress={() => onSelectUser(user)}
              >
                <Avatar size={45} uri={user.avatar} />
                <Typo fontWeight={"500"}>{user.name}</Typo>
                {isGroupMod && (
                  <View style={styles.selectIndicater}>
                    <View
                      style={[styles.checkBox, isSelected && styles.checked]}
                    ></View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {isGroupMod && selectedParticipants.length >= 2 && (
          <View style={styles.createGroupButton}>
            <Button
              onPress={createGroup}
              disabled={!groupName}
              loading={isLoading}
            >
              <Typo fontWeight={"bold"} size={17}>
                Create Group
              </Typo>
            </Button>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewConversationModal;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacingX._15,
    flex: 1,
  },
  groupinfocontainer: {
    alignItems: "center",
    marginTop: spacingX._10,
  },
  avatarContainer: {
    marginBottom: spacingY._10,
  },
  groupNameContainer: {
    width: "100%",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    paddingVertical: spacingY._5,
  },
  selectdContact: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
  },
  contactList: {
    gap: spacingY._12,
    marginTop: spacingY._10,
    paddingTop: spacingY._10,
    // Extra bottom padding so last contact isn't hidden behind the fixed "Create Group" button
    paddingBottom: spacingY._40,
  },
  selectIndicater: {
    marginLeft: "auto",
    marginRight: spacingX._10,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checked: {
    backgroundColor: colors.primary,
  },
  createGroupButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacingX._15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
});
