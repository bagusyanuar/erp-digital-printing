"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { LuMail, LuLock, LuLogIn } from "@erp-digital-printing/ui/icons"
import { TextField } from "@erp-digital-printing/ui/TextField"
import { PasswordField } from "@erp-digital-printing/ui/PasswordField"
import { Button } from "@erp-digital-printing/ui/Button"
import { Checkbox } from "@erp-digital-printing/ui/Checkbox"
import { Label } from "@erp-digital-printing/ui/Label"

interface LoginPageProps {
    logo?: string;
}

export default function LoginPage({ logo }: LoginPageProps) {
    const [isLoading, setIsLoading] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulasi loading 2 detik
        setTimeout(() => {
            setIsLoading(false)
        }, 2000)
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-sans text-foreground">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[400px] space-y-8"
            >
                {/* Header Logo & Title */}
                <div className="flex flex-col space-y-4 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mx-auto flex items-center justify-center"
                    >
                        {logo ? (
                            <div className="relative">
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="h-24 w-auto object-contain drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] dark:invert dark:hue-rotate-180 dark:brightness-125"
                                />
                                <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10 rounded-full" />
                            </div>
                        ) : (
                            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/30">
                                <LuLogIn size={32} />
                            </div>
                        )}
                    </motion.div>
                    <div className="space-y-1.5">
                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                            ERP Printing
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium max-w-[280px] mx-auto leading-relaxed">
                            Silakan login untuk mengelola operasional Anda secara efisien
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-2xl shadow-foreground/5 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email address</Label>
                            <TextField
                                id="email"
                                type="email"
                                placeholder="bosku@digitalprint.com"
                                prefixIcon={LuMail}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="password">Password</Label>
                                <a href="#" className="text-xs text-primary hover:underline font-semibold transition-all">
                                    Lupa password?
                                </a>
                            </div>
                            <PasswordField
                                id="password"
                                placeholder="••••••••"
                                prefixIcon={LuLock}
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-3 px-1">
                            <Checkbox id="remember" />
                            <Label htmlFor="remember" className="text-xs font-medium cursor-pointer select-none">
                                Ingat saya di perangkat ini
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl font-bold text-base"
                            loading={isLoading}
                        >
                            Masuk Sekarang
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground">
                    Belum punya akun?{" "}
                    <a href="#" className="text-primary hover:underline font-bold transition-all">
                        Hubungi Admin
                    </a>
                </p>
            </motion.div>
        </div>
    )
}
