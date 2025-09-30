"use server";
import dbConnect from "@/lib/db-connect";
import axios from "axios";
import { revalidatePath } from "next/cache";
import cloudinary from "@/lib/cloudinary";

export const UploadImage = async (image: File) => {
  try {
    await dbConnect();
    if (!image) {
      return {
        success: false,
        message: "No file received.",
        status: 400,
      };
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const maxFileSize = 0.5 * 1024 * 1024; // 500KB

    if (!image.type || !allowedTypes.includes(image.type)) {
      return {
        success: false,
        message: "Only JPEG, PNG, and GIF files are allowed.",
        status: 400,
      };
    }

    if (image.size > maxFileSize) {
      return {
        success: false,
        message: "File size must be less than 500KB.",
        status: 400,
      };
    }

    // Convert image to Data URI
    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUri = `data:${image.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri);
    revalidatePath("/client/setting/add-payment-method");

    return {
      success: true,
      message: "Successfully uploaded to Cloudinary",
      status: 200,
      filePath: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      message: "Failed to upload to Cloudinary",
      status: 500,
    };
  }
};

const getPublicIdFromUrl = async (imageUrl: string) => {
  try {
    await dbConnect();
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/");

    const uploadIndex = parts.findIndex((part) => part === "upload");
    if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) return null;

    const publicIdParts = parts.slice(uploadIndex + 1);
    const filename = publicIdParts.pop()!;
    const filenameWithoutExt = filename.replace(/\.[^/.]+$/, ""); // remove extension
    return filenameWithoutExt;
  } catch (err) {
    console.error("Error parsing image URL:", err);
    return null;
  }
};

export const DeleteImage = async (imageUrl: string) => {
  try {
    await dbConnect();
    const publicId = getPublicIdFromUrl(imageUrl);

    if (!publicId) {
      return {
        success: false,
        message: "Image not found or already deleted (skipped)",
        status: 200,
      };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    revalidatePath("/client/setting/add-payment-method");
    return {
      success: result.result === "ok",
      message:
        result.result === "ok"
          ? "Successfully deleted image"
          : `Image not deleted: ${result.result}`,
      status: 200,
    };
  } catch (err) {
    console.error("Cloudinary deletion error:", err);
    return {
      success: false,
      message: "Error deleting image",
      status: 500,
    };
  }
};

export const SendMessage = async (number: string, msg: string) => {
  try {
    const apiKey = process.env.SPARROW_TOKEN;

    if (!apiKey) {
      return {
        message: "faild to send message. Internal Issue",
        status: 400,
        succes: false,
      };
    }

    await axios.get(
      `https://api.sparrowsms.com/v2/sms/?token=${apiKey}&from=TheAlert&to=${number}&text=${msg}`
    );
    return {
      message: "successfully notified",
      status: 200,
      success: true,
    };
  } catch (error) {
    // Log and handle errors
    console.error("Error sending SMS:", error);

    return {
      message: "Internal server error",
      status: 500,
      succes: false,
    };
  }
};
