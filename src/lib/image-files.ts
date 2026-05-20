const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
]);

const ALLOWED_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif)$/i;

export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;

/** MIME may be empty on iOS when picking from the photo library. */
export function isAllowedImageFile(file: File): boolean {
    if (file.type && ALLOWED_IMAGE_TYPES.has(file.type)) {
        return true;
    }
    return ALLOWED_IMAGE_EXTENSIONS.test(file.name);
}

export const IMAGE_FILE_ACCEPT =
    "image/jpeg,image/png,image/webp,image/heic,image/heif,image/*";
