import { Dimensions,PixelRatio } from "react-native";

const {width: SCREEN_WIDTH,height : SCREEN_HEIGHT} = Dimensions.get("window");

const [shortDimenstion,longDismsion] = 
SCREEN_WIDTH < SCREEN_HEIGHT
 ? [SCREEN_WIDTH,SCREEN_HEIGHT]
 : [SCREEN_HEIGHT,SCREEN_WIDTH]

 const guidelineBaseWidth = 375;
 const guidlineBaseHeight = 812;

 export const scale = (size : number) => {
    return Math.round(
        PixelRatio.roundToNearestPixel(
            (shortDimenstion / guidelineBaseWidth) * (size as number)
        )
    )
 }

 export const verticalScale = (size : number) => {
   return  Math.round(
        PixelRatio.roundToNearestPixel(
            (longDismsion / guidlineBaseHeight) * (size as number)
        )
    )
 }