import { storage } from "@/lib/firebase/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuIdV4 } from "uuid";

type FolderType = "Products" | "Categories" | "SubCategories" | "Carousels" | "Thumbnails" | "ProfileImages" | "Demo" | "ActivationPayment" | "OrdersPayment";

export async function uploadImageFirebase(file: File, folder: `flex-aura/${FolderType}`, id?: string) {
    const customID = id || uuIdV4();

    // Use the original file's extension if possible, or fallback to something
    const extension = file.name.split('.').pop() || 'png';
    const fileRef = ref(storage, `${folder}/${customID}.${extension}`);

    try {
        // Upload the file directly from the client side browser
        const snapshot = await uploadBytes(fileRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return {
            url: downloadURL,
        };
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
}
