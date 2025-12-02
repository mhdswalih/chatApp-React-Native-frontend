import { CLOUDINARY_NAME, CLOUDINARY_UPLOADS } from "@/constants";
import { ResponseProps } from "@/type";
import axios from "axios";
import { Platform } from "react-native";

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;

const getMimeType = (uri: string): string => {
  const ext = uri.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
    case "heif":
      return "image/heic";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    default:
      return "image/jpeg"; // fallback
  }
};

export const uploadFileCloudinary = async (
  file: { uri?: string; file?: File } | string | File,
  folderName: string
): Promise<ResponseProps> => {
  try {
    if (!file) return { success: true, data: null };
    if (typeof file === "string") return { success: true, data: file };

    const formData = new FormData();

    // Handle web File object (direct File or object with file property)
    if (file instanceof File) {
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOADS || "");
      formData.append("folder", folderName);

      const response = await axios.post(CLOUDINARY_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data.secure_url,
      };
    }

    // Handle object with file property (web)
    if (typeof file === "object" && "file" in file && file.file) {
      formData.append("file", file.file);
      formData.append("upload_preset", CLOUDINARY_UPLOADS || "");
      formData.append("folder", folderName);

      const response = await axios.post(CLOUDINARY_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data.secure_url,
      };
    }

    // Handle mobile {uri} object or web blob/data URLs
    if (typeof file === "object" && "uri" in file && file.uri) {
      const uri = file.uri;
      const fileName = uri.split("/").pop() || "image.jpg";
      const mimeType = getMimeType(uri);

      // For web, if uri is a blob/data URL, convert to File
      if (Platform.OS === "web" && (uri.startsWith("blob:") || uri.startsWith("data:"))) {
        try {
          // Fetch the blob and convert to File
          const response = await fetch(uri);
          const blob = await response.blob();
          const webFile = new File([blob], fileName, { type: mimeType });
          formData.append("file", webFile);
        } catch (fetchError) {
          // Fallback to mobile-style upload
          formData.append("file", {
            uri: uri,
            name: fileName,
            type: mimeType,
          } as any);
        }
      } else {
        // Mobile native upload
        formData.append("file", {
          uri: uri,
          name: fileName,
          type: mimeType,
        } as any);
      }

      formData.append("upload_preset", CLOUDINARY_UPLOADS || "");
      formData.append("folder", folderName);

      const response = await axios.post(CLOUDINARY_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data.secure_url,
      };
    }

    return { success: true, data: null };
  } catch (error: any) {
    // This is where "Cloudinary upload error" is logged
    console.log("Cloudinary upload error", error?.response?.data || error);
    return {
      success: false,
      msg: error?.response?.data?.error?.message || "Upload failed",
    };
  }
};

export const getAvatar = (file: any, isGroup = false) => {
  if (file && typeof file == "string") return file;

  if (file && typeof file == "object") {
    // Handle web File object with uri property
    if (file.uri) return file.uri;
    // Handle web File object directly (create object URL)
    if (file instanceof File || file.file) {
      // For web, create a blob URL from File
      if (typeof window !== "undefined" && (file instanceof File || file.file)) {
        const fileObj = file instanceof File ? file : file.file;
        return URL.createObjectURL(fileObj);
      }
    }
  }

  if (isGroup) return require("../assets/images/defaultGroupAvatar.png");

  return require("../assets/images/defaultAvatar.png");
};
