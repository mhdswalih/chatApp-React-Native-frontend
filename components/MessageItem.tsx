import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { MessageProps } from "@/type";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { useAuth } from "@/context/authContext";
import Avatar from "./Avatar";
import Typo from "./Typo";
import { Image } from "expo-image";
const MessageItem = ({
  item,
  isDirect,
}: {
  item: MessageProps;
  isDirect: boolean;
}) => {
  const formatMessageTime = (date: string | Date) => {
    const msgDate = new Date(date);
    const now = new Date();

    const isToday = msgDate.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday = msgDate.toDateString() === yesterday.toDateString();

    // ✅ Always return time
    const time = msgDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) {
      return time; // 4:15 PM
    }

    if (isYesterday) {
      return "Yesterday"; // Yesterday
    }

    return time; // ✅ Still show TIME, not date
  };

  const { user: currentUser } = useAuth();
  const isMe = currentUser?.id === item?.sender?.id;
  return (
    <View
      style={[
        styles.messageContainer,
        isMe ? styles.myMessage : styles.thireMessage,
      ]}
    >
      {!isMe && !isDirect && (
        <Avatar size={30} uri={item.sender.avatar} style={styles.messageAvatar} />
      )}
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myBubble : styles.theirbubble,
        ]}
      >
        {!isMe && !isDirect && (
          <Typo color={colors.neutral900} fontWeight={"600"} size={13}>
            {item.sender.name}
          </Typo>
        )}
        {item.attachment && (
          <Image
            source={item.attachment}
            contentFit="cover"
            style={styles.attachment}
            transition={100}
          />
        )}
        {item.content && <Typo size={15}>{item.content}</Typo>}
        <Typo
          style={{ alignSelf: "flex-end" }}
          size={11}
          fontWeight={"500"}
          color={colors.neutral600}
        >
          {formatMessageTime(item.createdAt)}
        </Typo>
      </View>
    </View>
  );
};

export default MessageItem;

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    gap: spacingX._7,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  thireMessage: {
    alignSelf: "flex-start",
  },
  messageAvatar: {
    alignSelf: "flex-end",
  },
  attachment: {
    height: verticalScale(180),
    width: verticalScale(180),
    borderRadius: radius._10,
  },
  messageBubble: {
    padding: spacingX._10,
    borderRadius: radius._15,
    gap: spacingY._5,
  },
  myBubble: {
    backgroundColor: colors.myBubble,
  },
  theirbubble: {
    backgroundColor: colors.otherBubble,
  },
});
