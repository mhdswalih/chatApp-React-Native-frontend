import {
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/context/authContext";
import Typo from "@/components/Typo";
import * as Icons from "phosphor-react-native";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import ConversationItem from "@/components/ConversationItem";
import Loading from "@/components/Loading";
import Button from "@/components/Button";
import { getConversations, newConversation, newMessage } from "@/socket/socketEvents";
import { ConversationProps, ResponseProps } from "@/type";
const Home = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading,setLoading] = useState(false)
  const [conversations,setConversations] = useState<ConversationProps[]>([])
  const handleLogout = async () => {
    await signOut();
  };

 
  
  
  let directMessge = conversations
    .filter((item  :ConversationProps  ) => item.type === "direct")
    .sort((a: any, b: any) => {
      const aDate = a?.lastMessge?.createdAt || a.createdAl;
      const bDate = a?.lastMessge?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  let groupMessge = conversations
    .filter((item: ConversationProps) => item.type === "group")
    .sort((a: any, b: any) => {
      const aDate = a?.lastMessge?.createdAt || a.createdAl;
      const bDate = a?.lastMessge?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  // useEffect(() => {
  //   testSocket(teseSocketCallBackHandler);

  //   return () => {
  //     testSocket(teseSocketCallBackHandler, true);
  //   };
  // }, []);
  // const teseSocketCallBackHandler = (data : any) => {
  //   console.log('got response from test socket event : ',data);
  // }
  useEffect(() =>{
   getConversations(processConversation)
   newConversation(processConversationHandler)
   newMessage(newMessageHandler)
   getConversations(null)
   return () => {
   getConversations(processConversation,true)
   newConversation(processConversationHandler,true)
   newMessage(newMessageHandler,true)

   }
  },[])
 const processConversation = (res:ResponseProps) =>{
   if(res.success){
    setConversations(res.data)
   }
 }
 const newMessageHandler = (res:ResponseProps) => {
    if(res.data){
      let conversationId = res.data.conversationId;
      setConversations((prev) => {
        let updateConversation = prev.map((item) => {
          if(item._id == conversationId) item.lastMessage = res.data;
          return item
        })
        return updateConversation
      })
    }
 }
 const  processConversationHandler = (res : ResponseProps) => {
   if(res.success && res.data.isNew) {
   setConversations((prev) => [...prev,res.data])
   }
 } 

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typo
              color={colors.neutral200}
              size={19}
              textProps={{ numberOfLines: 1 }}
            >
              Welcome Back,{" "}
              <Typo color={colors.white} size={20} fontWeight={"800"}>
                {user?.name}
              </Typo>{" "}
              ✌️
            </Typo>
          </View>
          <TouchableOpacity
            style={styles.settingIcon}
            onPress={() => router.push("/(main)/profileModal")}
          >
            <Icons.GearSixIcon
              color={colors.white}
              weight="fill"
              size={verticalScale(22)}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacingX._20 }}
          >
            <View style={styles.navBar}>
              <View style={styles.tabs}>
                <TouchableOpacity
                  onPress={() => setSelectedTab(0)}
                  style={[
                    styles.tabStyle,
                    selectedTab == 0 && styles.activeStyle,
                  ]}
                >
                  <Typo>Direct Messages</Typo>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedTab(1)}
                  style={[
                    styles.tabStyle,
                    selectedTab == 1 && styles.activeStyle,
                  ]}
                >
                  <Typo>Groups</Typo>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.conversationList}>
              {selectedTab == 0 &&
                directMessge.map((item: ConversationProps, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directMessge.length != index + 1}
                    />
                  );
                })}
                 {selectedTab == 1 &&
                groupMessge.map((item: ConversationProps, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={groupMessge.length != index + 1}
                    />
                  );
                })}
            </View>
            {
              !loading && selectedTab == 0 && directMessge.length == 0 &&(
                <Typo style={{textAlign : 'center'}}>You don't have any messages</Typo>
              )
            }
              {
              !loading && selectedTab == 1 && groupMessge.length == 0 && (
                <Typo style={{textAlign : 'center'}}>You have't joined any groups yet</Typo>
              )
            }
            {
              loading && <Loading />
            }
          </ScrollView>
        </View>
      </View>
      <Button style={styles.floatingButton} onPress={() => router.push({ pathname: "/(main)/newConversationModal ",
        params : {isGroup : selectedTab},
       })
    }>
         <Icons.PlusIcon
          color={colors.black}
          weight="bold"
          size={verticalScale(24)}
         />
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    gap: spacingY._15,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._20,
  },
  navBar: {
    flexDirection: "row",
    gap: spacingX._15,
    alignItems: "center",
    paddingHorizontal: spacingX._10,
  },
  tabs: {
    flexDirection: "row",
    gap: spacingX._10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabStyle: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius.full,
    backgroundColor: colors.neutral100,
  },
  activeStyle: {
    backgroundColor: colors.primaryLight,
  },
  conversationList: {
    paddingVertical: spacingY._20,
  },
  settingIcon: {
    padding: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
});
