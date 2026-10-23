"use client";

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LuShieldAlert, LuArrowLeft, LuFileText } from "@erp-digital-printing/ui/icons";
import { Button } from "@erp-digital-printing/ui/Button";

import { useProfile } from "../../user/hooks/useProfile";
import { getDefaultHomePath } from "../utils/role.utils";

interface ForbiddenPageProps {
  onBackToAllowed?: () => void;
  allowedPath?: string;
  allowedPathLabel?: string;
}

export const ForbiddenPage = ({
  onBackToAllowed,
  allowedPath,
  allowedPathLabel,
}: ForbiddenPageProps) => {
  const navigate = useNavigate();
  const { data: userProfile } = useProfile();

  const resolvedAllowedPath =
    allowedPath || getDefaultHomePath(userProfile?.roles);

  const resolvedAllowedLabel =
    allowedPathLabel ||
    (resolvedAllowedPath === "/order"
      ? "Ke Pesanan Baru"
      : resolvedAllowedPath === "/ticket-order"
        ? "Ke Tiket Pesanan"
        : "Ke Dashboard");

  const handleGoAllowed = () => {
    if (onBackToAllowed) {
      onBackToAllowed();
    } else {
      navigate(resolvedAllowedPath);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 text-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-8 max-w-lg mx-auto"
      >
        {/* Floating Animated Shield Icon */}
        <div className="relative mx-auto h-40 w-40 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: [0, -4, 4, 0],
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-10 text-rose-500 dark:text-rose-400 drop-shadow-[0_10px_20px_rgba(244,63,94,0.3)]"
          >
            <LuShieldAlert size={84} strokeWidth={1.6} />
          </motion.div>

          {/* Background Decorative Ambient Glows */}
          <div className="absolute inset-0 bg-rose-500/15 blur-3xl rounded-full" />
          <div className="absolute top-2 right-2 h-16 w-16 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
        </div>

        {/* Text Area */}
        <div className="space-y-3 relative flex flex-col items-center justify-center min-h-[170px]">
          {/* Watermark 403 */}
          <h1 className="text-[13rem] font-black tracking-tighter text-rose-500/[0.06] dark:text-rose-500/[0.10] select-none absolute pointer-events-none leading-none z-0">
            403
          </h1>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide uppercase z-10">
            <span>Akses Ditolak</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight z-10">
            Akses Dibatasi, Bosku!
          </h2>

          <p className="text-muted-foreground max-w-md mx-auto text-base sm:text-lg font-medium leading-relaxed z-10">
            Role akun Anda saat ini tidak memiliki izin untuk membuka halaman ini.
            Silakan hubungi Administrator jika Anda memerlukan akses.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            prefixIcon={LuArrowLeft}
            onClick={handleGoBack}
            className="w-full sm:w-auto rounded-2xl px-6 h-12 text-sm font-bold border-border/80 hover:bg-muted"
          >
            Kembali
          </Button>

          <Button
            size="lg"
            prefixIcon={LuFileText}
            onClick={handleGoAllowed}
            className="w-full sm:w-auto rounded-2xl px-8 h-12 text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {resolvedAllowedLabel}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForbiddenPage;
