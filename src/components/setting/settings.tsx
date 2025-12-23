"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DsButton from "@/ui/ds/Button";
import { ModeToggle } from "@/components/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { ChevronRightIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { ABeeZee } from "next/font/google";
import { useAppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/auth";
import { useDeleteAccountMutation } from "@/redux/services/haveme/user";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { toast } from "../ui/use-toast";
import { Award } from "lucide-react";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const Settings: React.FC = () => {
  const router = useRouter();
  const { isMobile } = useClientHardwareInfo();
  const appDispatcher = useAppDispatch();
  const { user } = useUserOnboardingContext();
  const [deleteAccountTrigger] = useDeleteAccountMutation();

  const designEnabled =
    String(process.env.NEXT_PUBLIC_DESIGN || "") === "1" ||
    String(process.env.NEXT_PUBLIC_DESIGN_PROFILE || "") === "1";

  const handleLogout = async () => {
    await appDispatcher(logout());
    router.push("/signup");
  };

  const handleDeleteAccount = () => {
    deleteAccountTrigger(user?._id)
      .unwrap()
      .then((res) => {
        toast({
          description: "Account deleted successfully",
          variant: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        toast({
          description: "Something went wrong",
          variant: "destructive",
        });
      });
  };

	return (
		<div className="lg:flex lg:flex-col lg:justify-center lg:h-fit lg:align-middle ">
			<div className="px-4 lg:w-11/12 lg:mx-auto lg:space-y-5">
				{/* Account Control */}
				<div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
					<h2 className="text-sm text-muted-foreground lg:pb-2 lg:text-lg">Account Control</h2>
					<div className="flex items-center justify-between">
						<div>
							<h3>Delete Account</h3>
							<p className="text-sm lg:text-muted-foreground">Permanently remove your account</p>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<DsButton variant="ghost" className="text-[hsl(var(--destructive))]">Delete</DsButton>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete your account and remove your data from our servers.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={() => handleDeleteAccount()}>Continue</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>

				{/* Appearance */}
				<div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
					<h2 className="text-sm text-muted-foreground lg:pb-2 lg:text-lg">Appearance</h2>
					<div className="flex justify-between items-center">
						<div>
							<h3 className={`${fontItalic.className}`}>Theme</h3>
							<p className="text-sm lg:text-muted-foreground">Choose light or dark mode</p>
						</div>
						<ModeToggle />
					</div>
				</div>

				{/* Accounts */}
				<div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
					<h2 className="text-sm text-muted-foreground lg:pb-2 lg:text-lg">Accounts</h2>
					<div className="flex justify-between items-center">
						<div>
							<h3 className={`${fontItalic.className}`}>Add another account</h3>
							<p className="text-sm lg:text-muted-foreground">Create a new account on this device</p>
						</div>
						<DsButton
							onClick={async () => {
								await appDispatcher(logout());
								router.push("/signup?new=1");
							}}
							variant="secondary"
						>
							Start
						</DsButton>
					</div>
				</div>

				{/* Mentor */}
				<div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
					<h2 className="text-sm text-muted-foreground lg:pb-2 lg:text-lg">Mentor</h2>
					<div
						className="flex justify-between items-center cursor-pointer"
						onClick={() => {
							if (!designEnabled) {
								toast({
									variant: "destructive",
									description: "Mentor settings are not enabled in this environment.",
								});
								return;
							}
							router.push("/feature/design/mentor-settings");
						}}
					>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00AEEF]/10 to-[#0078D7]/10 flex items-center justify-center border border-[#00AEEF]/20">
								<Award className="h-5 w-5 text-[#0078D7]" />
							</div>
							<div>
								<h3 className={`${fontItalic.className}`}>Mentor Mode</h3>
								<p className="text-sm lg:text-muted-foreground">
									{(user as any)?.isMentor ? "Manage your mentor profile and tools" : "Become a mentor and set up your profile"}
								</p>
							</div>
						</div>
						<ChevronRightIcon className="text-primary" />
					</div>
				</div>

				{/* Data */}
				<div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
					<h2 className="text-sm text-muted-foreground lg:pb-2 lg:text-lg">Data</h2>
					<div className="flex justify-between items-center cursor-pointer" onClick={() => router.push("/settings/download-data")}>
						<div>
							<h3 className={`${fontItalic.className}`}>Download your data</h3>
							<p className="text-sm lg:text-muted-foreground">Get a copy of your Mentorio data</p>
						</div>
						<ChevronRightIcon className="text-primary" />
					</div>
				</div>

				{/* Notifications */}
				<div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
					<h2 className="text-sm text-muted-foreground lg:pb-2 lg:text-lg">Notifications</h2>
					<div className="flex justify-between items-center">
						<h3 className={`${fontItalic.className}`}>Push Notifications</h3>
						<Switch id="private-account" />
					</div>
					<p className="text-sm lg:text-muted-foreground">
						Stay on top of notifications for likes, comments, the latest videos, and more on mobile. You can turn them off anytime.
					</p>
					<div className="flex justify-between items-center my-2 cursor-pointer" onClick={() => router.push("/settings/system-settings")}>
						<div>
							<h3 className={`${fontItalic.className}`}>All System Notifications</h3>
							<p className="text-sm lg:text-muted-foreground">Get all system updates</p>
						</div>
						<ChevronRightIcon className="text-primary" />
					</div>
				</div>

				{/* Legal */}
				<div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
					<h2 className="text-sm text-muted-foreground lg:pb-2 lg:text-lg">Legal</h2>
					<div className="grid grid-cols-2 gap-3 text-sm">
						<a className="underline text-muted-foreground" href="/legal/terms" target="_blank" rel="noreferrer">Terms</a>
						<a className="underline text-muted-foreground" href="/legal/privacy" target="_blank" rel="noreferrer">Privacy</a>
						<a className="underline text-muted-foreground" href="/legal/guidelines" target="_blank" rel="noreferrer">Guidelines</a>
						<a className="underline text-muted-foreground" href="/legal/ai" target="_blank" rel="noreferrer">AI Use</a>
					</div>
				</div>

				{/* Logout */}
				<div className="w-full flex align-middle justify-center">
					<DsButton onClick={handleLogout} variant={"primary"} className="mt-1 w-full lg:w-1/2">
						Logout
					</DsButton>
				</div>
			</div>
		</div>
	);
};

export default Settings;
