import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { login, register } from "@/service/authService";
import { AuthContextProps, DecodedTokenProps, UserProps } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { connectionSocket, disconnectSocket } from "@/socket/socket";

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateToken: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProps | null>(null);
  const router = useRouter();

  const loadToken = async() => {
    const storedToken = await AsyncStorage.getItem("token")
    if(storedToken){
      try {
         const decoded = jwtDecode<DecodedTokenProps>(storedToken)
         if(decoded.exp && decoded.exp < Date.now() /1000){
            await AsyncStorage.removeItem('token');
            goToWelcomePage()
            return
         }

         setToken(storedToken)
         await connectionSocket()
         setUser(decoded.user)
         goToHomePage()
      } catch (error) {
        goToWelcomePage() 
        console.log("faild to decod token" ,error);
           
      }
    }else{
      goToWelcomePage()
    }
  }

  const goToHomePage = async() => {
    setTimeout(()=>{
      router.replace('/(main)/home')
    },1500)
  }
  const goToWelcomePage = async() => {
     setTimeout(()=>{
      router.replace('/(auth)/Welcome')
    },1500)
  }
  useEffect(() =>{
    loadToken()
  },[])
  const updateToken = async (token: string) => {
    setToken(token);
    await AsyncStorage.setItem("token", token);
    const decoded = jwtDecode<DecodedTokenProps>(token);
    setUser(decoded.user);
  };

  const signIn = async (email: string, password: string) => {
    const response = await login(email, password);
    await updateToken(response.token);
    await connectionSocket()
    router.replace("/(main)/home");
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    avatar?: string | null
  ) => {
    const response = await register(email, password, name, avatar || null);
    await updateToken(response.token);
    await connectionSocket()
    router.replace("/(main)/home");
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("token");
    disconnectSocket()
    setToken(null);
    setUser(null);
    router.replace("/(auth)/Welcome");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, signIn, signUp, signOut, updateToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)