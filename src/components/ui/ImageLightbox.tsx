import { useCallback, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LightboxImage {
    url: string;
    /** Optional caption shown at the bottom of the viewer. */
    caption?: string;
}

interface ImageLightboxProps {
    images: LightboxImage[];
    /** Index to open at; pass -1 (default) to keep closed. */
    openIndex: number | null;
    onClose: () => void;
}

/**
 * Full-bleed image viewer. Built directly on Radix Dialog primitives so we get
 * focus trapping, ESC-to-close and the escape hatch from the sibling Dialog
 * stack — without inheriting the styled DialogContent constraints.
 */
const ImageLightbox = ({
    images,
    openIndex,
    onClose,
}: ImageLightboxProps) => {
    const [index, setIndex] = useState(0);
    const open = openIndex !== null && openIndex >= 0 && images.length > 0;

    useEffect(() => {
        if (open) setIndex(openIndex ?? 0);
    }, [open, openIndex]);

    const goPrev = useCallback(
        () => setIndex((i) => (i - 1 + images.length) % images.length),
        [images.length]
    );
    const goNext = useCallback(
        () => setIndex((i) => (i + 1) % images.length),
        [images.length]
    );

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, goPrev, goNext]);

    if (!images.length) return null;
    const current = images[index];
    const showNav = images.length > 1;

    return (
        <DialogPrimitive.Root
            open={open}
            onOpenChange={(o) => {
                if (!o) onClose();
            }}
        >
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
                <DialogPrimitive.Content
                    aria-label="Receipt viewer"
                    className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 sm:p-8 outline-none"
                >
                    <DialogPrimitive.Title className="sr-only">
                        Receipt viewer
                    </DialogPrimitive.Title>

                    {/* Close */}
                    <DialogPrimitive.Close
                        className="absolute top-3 right-3 sm:top-5 sm:right-5 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </DialogPrimitive.Close>

                    {/* Prev / Next */}
                    {showNav && (
                        <>
                            <button
                                type="button"
                                onClick={goPrev}
                                aria-label="Previous"
                                className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                type="button"
                                onClick={goNext}
                                aria-label="Next"
                                className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <img
                        src={current.url}
                        alt={current.caption || "Receipt"}
                        className={cn(
                            "max-h-[85vh] max-w-full object-contain rounded-md shadow-2xl",
                            "select-none"
                        )}
                        draggable={false}
                    />

                    {/* Footer: caption + counter */}
                    <div className="mt-4 flex items-center gap-3 text-white/80 text-xs sm:text-sm">
                        {showNav && (
                            <span className="tabular-nums">
                                {index + 1} / {images.length}
                            </span>
                        )}
                        {current.caption && <span>{current.caption}</span>}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

export default ImageLightbox;
