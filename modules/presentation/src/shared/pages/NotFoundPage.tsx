"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { LuArrowLeft, LuFileSearch } from "@erp-digital-printing/ui/icons"
import { Button } from "@erp-digital-printing/ui/Button"

interface NotFoundPageProps {
    onBackHome?: () => void;
}

export default function NotFoundPage({ onBackHome }: NotFoundPageProps) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-8"
            >
                {/* Illustration Area */}
                <div className="relative mx-auto h-40 w-40 flex items-center justify-center">
                    <motion.div 
                        animate={{ 
                            rotate: [0, 5, -5, 0],
                            y: [0, -10, 0]
                        }}
                        transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="relative z-10 text-primary"
                    >
                        <LuFileSearch size={80} strokeWidth={1.5} />
                    </motion.div>
                    
                    {/* Background Decorative Blobs */}
                    <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                    <div className="absolute top-0 right-0 h-12 w-12 bg-primary/20 blur-xl rounded-full animate-pulse" />
                </div>

                {/* Text Content */}
                <div className="space-y-3 relative flex flex-col items-center justify-center min-h-[200px]">
                    <h1 className="text-[14rem] font-black tracking-tighter text-primary/[0.07] dark:text-primary/[0.12] select-none absolute pointer-events-none leading-none z-0">
                        404
                    </h1>
                    <h2 className="text-4xl font-extrabold text-foreground tracking-tight z-10">
                        Waduh, Kesasar Bosku?
                    </h2>
                    <p className="text-muted-foreground max-w-[400px] mx-auto text-lg font-medium leading-relaxed z-10">
                        Halaman yang Anda cari tidak ditemukan atau mungkin sudah dipindah ke percetakan lain.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center pt-4">
                    <Button 
                        size="lg" 
                        prefixIcon={LuArrowLeft}
                        onClick={onBackHome}
                        className="rounded-2xl px-10 h-14 text-base font-bold shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Balik ke Home
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
