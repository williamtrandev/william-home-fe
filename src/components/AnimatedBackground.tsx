import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
    /**
     * - "hero":    full intensity with 3 prominent floating blobs.
     *              Use on auth / marketing / standalone screens.
     * - "subtle":  gentle wash with 2 soft blobs.
     *              Use as the canvas behind in-app pages.
     */
    variant?: "hero" | "subtle";
}

/**
 * Animated, decorative background.
 *
 * Renders an absolutely-positioned gradient + dotted texture + floating glow
 * blobs. The parent MUST be `relative isolate` (and usually `overflow-hidden`)
 * so the blobs are clipped and stay behind the page content.
 */
const AnimatedBackground = ({ variant = "subtle" }: AnimatedBackgroundProps) => {
    const isHero = variant === "hero";

    return (
        <>
            <div className="absolute inset-0 -z-10 animated-gradient" />
            <div
                className={`absolute inset-0 -z-10 dot-pattern pointer-events-none ${
                    isHero ? "opacity-50" : "opacity-30"
                }`}
            />

            {isHero ? (
                <>
                    <motion.div
                        aria-hidden
                        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
                        transition={{
                            duration: 16,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-blue-400/30 dark:bg-blue-500/25 blur-3xl -z-10"
                    />
                    <motion.div
                        aria-hidden
                        animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="pointer-events-none absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-violet-400/30 dark:bg-violet-500/25 blur-3xl -z-10"
                    />
                    <motion.div
                        aria-hidden
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
                        transition={{
                            duration: 28,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] rounded-full bg-cyan-300/20 dark:bg-cyan-500/15 blur-3xl -z-10"
                    />
                </>
            ) : (
                <>
                    <motion.div
                        aria-hidden
                        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
                        transition={{
                            duration: 22,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="pointer-events-none absolute -top-40 -right-40 w-[22rem] h-[22rem] rounded-full bg-blue-300/20 dark:bg-blue-500/[0.18] blur-3xl -z-10"
                    />
                    <motion.div
                        aria-hidden
                        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
                        transition={{
                            duration: 26,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="pointer-events-none absolute -bottom-40 -left-20 w-[22rem] h-[22rem] rounded-full bg-violet-300/20 dark:bg-violet-500/[0.18] blur-3xl -z-10"
                    />
                </>
            )}
        </>
    );
};

export default AnimatedBackground;
