import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import { useAuth } from "@/context/authContext";
import { useLocalSearchParams } from "expo-router";
import { scale, verticalScale } from "@/utils/styling";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import * as Icons from "phosphor-react-native";
import MessageItem from "@/components/MessageItem";
import * as ImagePicker from "expo-image-picker";
import Input from "@/components/Input";
import Loading from "@/components/Loading";
import { uploadFileCloudinary } from "@/service/imageService";
import { getMessage, newMessage } from "@/socket/socketEvents";
import { MessageProps, ResponseProps } from "@/type";

const conversation = () => {
  const { user: currentUser } = useAuth();
  const {
    id: conversationId,
    name,
    participants: stringifiedParticipants,
    avatar,
    type,
  } = useLocalSearchParams();
  const [messages,setMessages] = useState<MessageProps[]>([])
  const [message,setMessage] = useState("")
  const [selectedFile,setSelectedFile] = useState<{uri : string} | null>(null)
  const [loading,setLoading] = useState(false)
  const participants = JSON.parse(stringifiedParticipants as string);

  let conversationAvatar = avatar;
  let isDirect = type == "direct";
  const otherParticipant = isDirect
    ? participants.find((p: any) => p._id !== currentUser?.id)
    : null;

  if (isDirect && otherParticipant)
    conversationAvatar = otherParticipant.avatar;
  let conversationName = isDirect ? otherParticipant.name : name;
  
  const onPickFile = async () => {
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
          setSelectedFile(asset);
        } else {
          // Mobile: store asset object with uri
          setSelectedFile(asset);
        }
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const onSend = async() => {
    if(!message.trim()) return;
    if(!currentUser) return
    if(!conversationId) {
      Alert.alert("Error", "Conversation ID is missing");
      return;
    }

     setLoading(true)
     try {
       let attachment = null
       if(selectedFile){
         const uploadFile = await uploadFileCloudinary(selectedFile,"message-attachment")
         if(uploadFile.success){
           attachment = uploadFile.data
         }else{
           setLoading(false)
           Alert.alert("Erro" ,"Failed to send file")
           return
         }
       }
       newMessage({
         conversationId,
         senderId: currentUser.id, 
         sender : {
           id :currentUser?.id,
           name : currentUser.name,
           avatar : currentUser.avatar

        },
        content : message.trim(),
        attachment
      })
      setMessage("")
      setSelectedFile(null)
      
    } catch (error) {
      console.log("Error in onSend:", error);
      Alert.alert("Erro" ,"Error to send message")
      setLoading(false)
    }
  }

  const newMessageHandler = (res: ResponseProps) => {
    setLoading(false);
    if (res.success && res.data) {
      // Only add if it's for this conversation
      if (res.data.conversationId === conversationId) {
        // Add the new message to the list
        const newMessage = {
          id: res.data.id,
          sender: res.data.sender,
          content: res.data.content || "",
          attachment: res.data.attachment || "",
          createdAt: res.data.createdAt,
          isMe: res.data.sender.id === currentUser?.id,
        };
        setMessages((prev) => [newMessage, ...prev]);
      }
    } else if (!res.success) {
      Alert.alert("Error", res.msg || "Failed to send message");
    }
  };
 
   const messageHandler = (res : ResponseProps) => {
       if(res.success) setMessages(res.data)
   }

  useEffect(() => {
    newMessage(newMessageHandler);
    getMessage(messageHandler)
    getMessage({conversationId})
    return () => {
      newMessage(newMessageHandler, true);
      getMessage(messageHandler,true)

    };
  }, []);

  
  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Header
          style={styles.headr}
          leftIcon={
            <View style={styles.headerLeft}>
              <BackButton />
              <Avatar
                size={40}
                uri={conversationAvatar as string}
                isGroup={type == "group"}
              />
              <Typo color={colors.white} fontWeight={"500"}>
                {conversationName}
              </Typo>
            </View>
          }
          rightIcon={
            <TouchableOpacity style={{marginBottom : verticalScale(7)}}>
              <Icons.DotsThreeOutlineVerticalIcon
                weight="fill"
                color={colors.white}
              />
            </TouchableOpacity>
          }
        />
        <View style={styles.content}>
          <FlatList
            data={messages}
            inverted={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messageContent}
            renderItem={({ item }) => (
              <MessageItem item={item} isDirect={isDirect} />
            )}
            keyExtractor={(item) => item.id}
          />
          <View style={styles.footer}>
            {selectedFile && selectedFile.uri && (
              <View style={styles.selectedFileContainer}>
                <Image
                  source={{ uri: selectedFile.uri }}
                  style={styles.selectedFileImage}
                />
                <TouchableOpacity 
                  style={styles.removeFileButton}
                  onPress={() => setSelectedFile(null)}
                >
                  <Icons.XIcon size={16} color={colors.white} weight="bold" />
                </TouchableOpacity>
              </View>
            )}
            <Input 
             value={message}
             onChangeText={setMessage}
             containerStyle={{
              paddingLeft : spacingX._10,
              paddingRight : scale(65),
               borderWidth : 0,
              }}
              placeholder="Type message"
              icon={
                <TouchableOpacity style={styles.inputIcon} onPress={onPickFile}>
                  {loading ? (
                    <Loading size="small" color={colors.black} />
                  ) : (
                    <Icons.PaperclipIcon color={colors.black} weight={"bold"} size={verticalScale(22)} />
                  )}
                </TouchableOpacity>
              }
            />
            <View style={styles.inputRightIcon}>
              <TouchableOpacity style={styles.inputIcon} onPress={onSend}>
              <Icons.PaperPlaneRightIcon color={colors.black} weight='fill' size={verticalScale(22)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default conversation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headr: {
    paddingHorizontal: spacingX._15,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  selectedIcon: {
    position: "absolute",
    right: scale(10),
    top: verticalScale(15),
    paddingLeft: spacingX._12,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.neutral300,
  },
  inputRightIcon : {
    position : "absolute",
    right : scale(10),
    top : verticalScale(15),
    paddingLeft : spacingX._12,
    borderLeftWidth : 1.5,
    borderLeftColor : colors.neutral300
  },
  selectedFileContainer: {
    position: "relative",
    marginBottom: spacingY._10,
    alignSelf: "flex-start",
  },
  selectedFileImage: {
    height: verticalScale(80),
    width: verticalScale(80),
    borderRadius: radius._10,
  },
  removeFileButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.neutral800,
    borderRadius: radius.full,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._15,
  },
  messageContainer : {
    flex : 1
  },
  inputIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
  footer: {
    paddingTop: spacingY._7,
    paddingBottom: verticalScale(22),
  },
  messageContent: {
    paddingTop: spacingY._20,
    paddingBottom: spacingY._20,
    gap: spacingY._12,
  },
  plusIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
});