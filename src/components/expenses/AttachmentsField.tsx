import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    expenseService,
    MAX_ATTACHMENTS_PER_EXPENSE,
    type Attachment,
} from "@/services/expense.service";
import ImageLightbox from "@/components/ui/ImageLightbox";
import {
    IMAGE_FILE_ACCEPT,
    MAX_IMAGE_FILE_BYTES,
    isAllowedImageFile,
} from "@/lib/image-files";
import { cn } from "@/lib/utils";

interface AttachmentsFieldProps {
    expenseId: string;
    attachments: Attachment[];
    onChange: (next: Attachment[]) => void;
    /** Only the creator can mutate. View-only otherwise. */
    canEdit: boolean;
}

const AttachmentsField = ({
    expenseId,
    attachments,
    onChange,
    canEdit,
}: AttachmentsFieldProps) => {
    const { t } = useLanguage();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const remaining = MAX_ATTACHMENTS_PER_EXPENSE - attachments.length;
    const canAddMore = canEdit && remaining > 0;

    const validateFiles = (files: File[]): File[] | null => {
        if (files.length > remaining) {
            toast.error(t("attachmentLimitReached"));
            return null;
        }
        for (const f of files) {
            if (!isAllowedImageFile(f)) {
                toast.error(t("attachmentTypeUnsupported"));
                return null;
            }
            if (f.size > MAX_IMAGE_FILE_BYTES) {
                toast.error(t("attachmentTooLarge"));
                return null;
            }
        }
        return files;
    };

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const picked = Array.from(e.target.files || []);
        // Reset the input immediately so picking the same file twice still fires.
        e.target.value = "";
        if (!picked.length) return;

        const files = validateFiles(picked);
        if (!files) return;

        try {
            setIsUploading(true);
            const next = await expenseService.uploadAttachments(
                expenseId,
                files
            );
            onChange(next);
            toast.success(t("attachmentUploaded"));
        } catch (err) {
            console.error("Attachment upload failed:", err);
            toast.error(t("attachmentUploadFailed"));
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async (publicId: string) => {
        if (!canEdit) return;
        if (!window.confirm(t("removeReceiptConfirm"))) return;
        try {
            setRemovingId(publicId);
            const next = await expenseService.deleteAttachment(
                expenseId,
                publicId
            );
            onChange(next);
        } catch (err) {
            console.error("Attachment delete failed:", err);
            toast.error(t("attachmentDeleteFailed"));
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                    {t("attachments")}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {attachments.length} / {MAX_ATTACHMENTS_PER_EXPENSE}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {attachments.map((a, idx) => (
                    <div
                        key={a.publicId}
                        className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted"
                    >
                        <button
                            type="button"
                            onClick={() => setLightboxIndex(idx)}
                            className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={t("viewReceipt")}
                        >
                            <img
                                src={a.url}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </button>
                        {canEdit && (
                            <button
                                type="button"
                                onClick={() => handleRemove(a.publicId)}
                                disabled={removingId === a.publicId}
                                aria-label={t("removeReceipt")}
                                className={cn(
                                    "absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-full",
                                    "bg-black/60 hover:bg-black/80 text-white",
                                    "opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity",
                                    removingId === a.publicId && "opacity-100"
                                )}
                            >
                                {removingId === a.publicId ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <X className="w-3 h-3" />
                                )}
                            </button>
                        )}
                    </div>
                ))}

                {canAddMore && (
                    <button
                        type="button"
                        data-file-picker-trigger
                        onClick={() => inputRef.current?.click()}
                        disabled={isUploading}
                        className={cn(
                            "aspect-square rounded-md border-2 border-dashed",
                            "border-primary/40 text-primary bg-primary/5",
                            "flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/10 transition-colors",
                            "disabled:opacity-60 disabled:cursor-not-allowed"
                        )}
                        aria-label={t("addReceipt")}
                    >
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <ImagePlus className="w-6 h-6" />
                        )}
                        <span className="text-[11px] font-semibold leading-tight text-center px-1">
                            {isUploading ? t("uploading") : t("addReceipt")}
                        </span>
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={IMAGE_FILE_ACCEPT}
                multiple
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={handleFileChange}
            />

            <ImageLightbox
                images={attachments.map((a) => ({ url: a.url }))}
                openIndex={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
            />
        </div>
    );
};

export default AttachmentsField;
