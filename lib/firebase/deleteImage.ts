import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";

// Delete image from Firebase if exists
export const deleteFirebaseImage = async (imageUrl: string) => {
  // Only handle Firebase storage download URLs; anything else (empty,
  // relative paths, or other origins) is not ours to delete.
  if (!imageUrl) return;
  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch {
    return;
  }
  const markerIndex = url.pathname.indexOf("/o/");
  const imagePath =
    markerIndex !== -1 ? decodeURIComponent(url.pathname.slice(markerIndex + 3)) : null;
  if (!imagePath || !imagePath.includes("/")) {
    return;
  }

  const imageRef = ref(storage, imagePath); // Use direct path
  await deleteObject(imageRef);
}

// Best-effort deletion: never throws. Use after a successful DB write, where
// image cleanup failure must not fail the operation (or mask the real error).
export const deleteFirebaseImageSafe = async (imageUrl: string) => {
  try {
    await deleteFirebaseImage(imageUrl);
  } catch (error) {
    console.error("Error deleting Firebase image:", error);
  }
}
