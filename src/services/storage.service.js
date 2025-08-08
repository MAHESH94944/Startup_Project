const ImageKit = require("imagekit");
const mongoose = require("mongoose");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
});

const uploadToImageKit = async (file) => {
  try {
    const result = await imagekit.upload({
      file: file.buffer,
      fileName:  new mongoose.Types.ObjectId().toString(),
      folder: "products",
    });
    return result;
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw error;
  }
};

module.exports = { imagekit, uploadToImageKit };
