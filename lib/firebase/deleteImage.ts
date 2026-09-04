import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";

// Delete image from Firebase if exists
export const deleteFirebaseImage = async (imageUrl: string) => {

    const oldImageUrl = new URL(imageUrl);

    const imagePath = decodeURIComponent(
        oldImageUrl.pathname.split("/o/")[1].split("?")[0]
    );

    const imageRef = ref(storage, imagePath); // Use direct path
    await deleteObject(imageRef);
}