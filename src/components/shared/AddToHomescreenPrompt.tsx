"use client";
import React, { useEffect, useState } from "react";
import { Home as HomeIcon } from "lucide-react";

export default function AddToHomescreenPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [show, setShow] = useState(false);
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		try {
			setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
			setIsStandalone((window.navigator as any).standalone || window.matchMedia("(display-mode: standalone)").matches);
			const handler = (e: any) => {
				e.preventDefault();
				setDeferredPrompt(e);
				setShow(true);
			};
			window.addEventListener("beforeinstallprompt", handler);
			return () => window.removeEventListener("beforeinstallprompt", handler);
		} catch {}
	}, []);

	if (isStandalone) return null;
	if (!show && !isIOS) return null;

	const showInstallButton = Boolean(deferredPrompt) && !isIOS;

	return (
		<div className="fixed inset-x-3 bottom-6 z-[10000] rounded-xl bg-black/85 text-white p-3 backdrop-blur-md shadow-lg border border-white/10">
			<div className="flex items-center gap-3">
				<div className="h-8 w-8 rounded bg-white/10 flex items-center justify-center">
					<HomeIcon size={16} className="text-white" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold">Add to Home Screen</p>
					<p className="text-xs text-white/80 truncate">Get a full-screen app experience on your phone.</p>
				</div>
				{showInstallButton ? (
					<button
						className="text-xs px-3 py-1.5 rounded-md bg-white text-black font-semibold"
						onClick={async () => {
							try {
								if (deferredPrompt) {
									deferredPrompt.prompt();
									const { outcome } = await deferredPrompt.userChoice;
									if (outcome) setShow(false);
								}
							} catch { setShow(false); }
						}}
					>
						Install
					</button>
				) : null}
				<button className="ml-2 text-xs" onClick={() => setShow(false)}>{isIOS ? "Got it" : "Close"}</button>
			</div>
			{isIOS && (
				<div className="mt-2 text-xs text-white/80">
					On iPhone, open in Safari, tap the share icon, then <span className="font-semibold">Add to Home Screen</span>.
				</div>
			)}
		</div>
	);
}
