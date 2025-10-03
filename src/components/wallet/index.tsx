"use client";
import React from "react";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ABeeZee } from "next/font/google";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  useDeleteCardMutation,
  useGetUserCardsQuery,
  useSetDefaultCardMutation,
} from "@/redux/services/haveme/card";
import { cn } from "@/lib/utils";
import { useState } from 'react';

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const cardArr = [
  {
    isDefault: false,
    cardId: 111,
    cardNo: `Visa .... 5471`,
    cardImg: `/assets/images/wallets/Payments.svg`,
    expiry: "expires 10/23",
  },
  {
    isDefault: false,
    cardId: 112,
    cardNo: `Visa .... 5472`,
    cardImg: `/assets/images/wallets/Payments.svg`,
    expiry: "expires 10/24",
  },
  {
    isDefault: false,
    cardId: 113,
    cardNo: `Visa .... 5473`,
    cardImg: `/assets/images/wallets/Payments.svg`,
    expiry: "expires 10/25",
  },
  {
    isDefault: true,
    cardId: 114,
    cardNo: `Visa .... 5474`,
    cardImg: `/assets/images/wallets/Payments.svg`,
    expiry: "expires 10/26",
  },
];

const Wallet: React.FC = () => {
  const router = useRouter();
  const [subStatus, setSubStatus] = useState<string>('');

  const { data: cardsData, isLoading } = useGetUserCardsQuery();
  return (
    <div className="h-screen">
      <div className="flex flex-col mx-auto w-full border-t  border-b border-muted-foreground/20">
        <div className="flex justify-between align-middle my-3 mx-4 lg:mx-12 lg:mt-6">
          <div className={` text-xl mt-1 ${fontItalic.className}`}>
            Payment Methods
          </div>
          <div className="">
            <Button
              onClick={() => router.push("/wallet/add-payment-method")}
              variant={"link"}
              className="text-primary tracking-wide pr-1"
            >
              Add payment method
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-6 justify-between align-middle mx-4 lg:mx-12 mb-4">
          {cardsData?.data?.map((card, item) => (
            <CardInfo card={card} key={card?._id}  />
          ))}
        </div>
      </div>
      <div className="mx-4 lg:mx-12">
        <div className={` text-xl my-4 ${fontItalic.className}`}>Services</div>
        <div className="flex justify-between lg:justify-start gap-2 flex-wrap">
          <div
            onClick={() => router.push("/wallet/transactions")}
            className="lg:flex lg:flex-col lg:justify-between rounded-xl bg-muted-foreground/20 w-1/2 lg:w-3/12 lg:h-32 p-3 mr-2 lg:cursor-pointer"
          >
            <div className="mt-2 mb-3">
              <img
                src="/assets/images/wallets/dollar-circle.svg"
                alt="dollar-circle"
                className="text-primary lg:w-auto lg:h-auto w-8 h-8"
              />
            </div>
            <div className="flex justify-between">
              <div className={` ${fontItalic.className}`}>Transactions</div>
              <div>
                <ChevronRight className="text-primary" />
              </div>
            </div>
          </div>
          <div
            data-test="wallet-help-support"
            onClick={async () => {
              try {
                setSubStatus('');
                const apiBase = process.env.NEXT_PUBLIC_API_SERVER ? `${process.env.NEXT_PUBLIC_API_SERVER}/v1` : '/api/backend/v1';
                const r = await fetch(`${apiBase}/payments/create-session`, { method:'POST', credentials:'include' });
                const j = await r.json().catch(()=>({}));
                if (r.ok && j?.data?.clientSecret) {
                  setSubStatus(`Client secret created: ${j.data.clientSecret.slice(0,8)}…`);
                  // Quick entitlement check
                  try {
                    const gate = await fetch('/api/backend/v1/feature/protected-check', { credentials:'include' });
                    if (gate.status === 403) setSubStatus((s)=> s + ' • gated (403)');
                    if (gate.status === 200) setSubStatus((s)=> s + ' • entitled (200)');
                  } catch {}
                } else {
                  setSubStatus('Failed to create session');
                }
              } catch {
                setSubStatus('Failed to create session');
              }
            }}
            className="lg:flex lg:flex-col lg:justify-between rounded-xl bg-muted-foreground/20 w-1/2 lg:w-3/12 p-3 ml-2 lg:cursor-pointer"
          >
            <div className="mt-2 mb-3">
              <img
                src="/assets/images/wallets/message-question.svg"
                alt="message-question"
                className="text-primary lg:w-auto lg:h-auto w-8 h-8"
              />
            </div>
            <div className="flex justify-between">
              <div className={` ${fontItalic.className}`}>Help & Support</div>
              <div>
                <ChevronRight className="text-primary" />
              </div>
            </div>
          </div>
          {/* Subscribe CTA */}
          <div
            onClick={async () => {
              try {
                setSubStatus('');
                const apiBase = process.env.NEXT_PUBLIC_API_SERVER ? `${process.env.NEXT_PUBLIC_API_SERVER}/v1` : '/api/backend/v1';
                const key = `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                const r = await fetch(`${apiBase}/payments/create-session`, { method:'POST', credentials:'include', headers: { 'Idempotency-Key': key } });
                const j = await r.json().catch(()=>({}));
                if (r.ok && j?.data?.clientSecret) {
                  setSubStatus(`Checkout started • ${j.data.clientSecret.slice(0,8)}…`);
                  // Poll entitlement status (payments/status), fall back to protected-check
                  let tries = 0; const maxTries = 20;
                  const tick = async () => {
                    tries++;
                    try {
                      const st = await fetch(`${apiBase}/payments/status`, { credentials:'include' });
                      if (st.ok) {
                        const sj = await st.json().catch(()=>({}));
                        if (sj?.active) { setSubStatus('Entitled (active=true)'); return; }
                      }
                    } catch {}
                    try {
                      const gate = await fetch(`${apiBase}/feature/protected-check`, { credentials:'include' });
                      if (gate.status === 200) { setSubStatus('Entitled (200)'); return; }
                    } catch {}
                    if (tries < maxTries) setTimeout(tick, 1500);
                    else setSubStatus((s)=> s ? s + ' • timed out' : 'Timed out');
                  };
                  tick();
                } else {
                  setSubStatus('Failed to start checkout');
                }
              } catch {
                setSubStatus('Failed to start checkout');
              }
            }}
            className="lg:flex lg:flex-col lg:justify-between rounded-xl bg-muted-foreground/20 w-full lg:w-3/12 p-3 lg:cursor-pointer"
          >
            <div className="mt-2 mb-3">
              <img
                src="/assets/images/wallets/Payments.svg"
                alt="subscribe"
                className="text-primary lg:w-auto lg:h-auto w-8 h-8"
              />
            </div>
            <div className="flex justify-between">
              <div className={` ${fontItalic.className}`}>Subscribe</div>
              <div>
                <ChevronRight className="text-primary" />
              </div>
            </div>
          </div>
        </div>
        {subStatus ? (<div data-test="wallet-client-secret" className="mt-3 text-sm text-muted-foreground">{subStatus}</div>) : null}
      </div>
    </div>
  );
};

const CardInfo = ({ card }) => {
  const [setDefaultCardTrigger] = useSetDefaultCardMutation();
  const [deleteCard] = useDeleteCardMutation();
  return (
    <div className="flex w-full justify-between">
      <div className="flex align-middle cursor-pointer">
        <div className="bg-muted flex justify-center align-middle rounded-md px-2.5">
          <img
            src="/assets/images/wallets/Payments.svg"
            alt="Payments"
            className="w-10 h-12 mt-1"
          />
        </div>
        <div className={cn("mx-4", card.isDefault && "text-primary")}>
          <div className={`text-lg ${fontItalic.className}`}>
            {`**** **** **** ${card.last4}`}
          </div>
          <div className="text-muted-foreground font-semibold">
            {card.exp_month}/{card.exp_year}
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-6 items-center">
        <Switch
          id="mute-notifications"
          checked={card.isDefault}
          onCheckedChange={() => setDefaultCardTrigger(card._id)}
        />
        {/* {!card?.isDefault && ( */}
        <AlertDialog>
          <AlertDialogTrigger disabled={card?.isDefault}>
            <Trash2 className={cn(card?.isDefault && "text-secondary")} />
          </AlertDialogTrigger>
          <AlertDialogContent className="m-auto w-11/12">
            <AlertDialogHeader className="">
              <AlertDialogTitle className="italic text-base pb-2">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                card and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteCard(card._id)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* )} */}
      </div>
    </div>
  );
};

export default Wallet;
