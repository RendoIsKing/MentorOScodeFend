import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { countryCodes } from "./countryCodes";
import { parseISO, formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const phoneNumberRefine = (phoneNumber: string, prefix: string, code?: string) => {
  let codeValue = code || ""
  let selectedCountry;
  if(codeValue){
     const country = countryCodes.find((c) => c.dial_code === prefix && c.code === codeValue );
     if(!country)
      return false;
     else
     selectedCountry = country;
  }
  else{
    const country = countryCodes.find((c) => c.dial_code === prefix );
    if (!country) 
      return false;
    else
    selectedCountry = country;
  }
 
  const phoneDigitsCount = selectedCountry.phone_digits_count.split("~");
  const [minDigits, maxDigits] = phoneDigitsCount;

  if (
    phoneNumber.length < parseInt(minDigits) ||
    phoneNumber.length > parseInt(maxDigits)
  ) {
    return false;
  }

  return true;
};

export const formatFullName = (fullName: string) => {
  let trimmedName = fullName.trim();
  let words = trimmedName.split(/\s+/);
  if (words.length > 1) {
    return `${words[0]} ${words[words.length - 1]}`;
  }
  return words[0] || "";
};

// export const isAuthenticated = true;

export const baseServerUrl = process.env.NEXT_PUBLIC_API_SERVER;

// Import functions from date-fns

export const formatTimestamp = (timestamp: string): string => {
  // Parse the ISO timestamp
  if (!timestamp) {
    return "Invalid timestamp";
  }

  const date: Date = parseISO(timestamp);
  const now: Date = new Date();

  // Calculate the difference in milliseconds
  const diffMilliseconds: number = now.getTime() - date.getTime();

  // Determine the appropriate relative time message
  if (diffMilliseconds < 60 * 1000) {
    return "few seconds ago";
  } else if (diffMilliseconds < 2 * 60 * 1000) {
    return "minute ago";
  } else if (diffMilliseconds < 60 * 60 * 1000) {
    return `${Math.floor(diffMilliseconds / (60 * 1000))} minutes ago`;
  } else if (diffMilliseconds < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diffMilliseconds / (60 * 60 * 1000))} hours ago`;
  } else {
    return format(date, "dd/MM/yyyy");
  }
};

export const isAuthenticated = true;

export const lowerCase = (str: string): string => {
  return str?.charAt(0).toLowerCase() + str?.slice(1).toLowerCase();
};

export const sentenceCase = (str: string): string => {
  return str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();
};

export const checkFixedPlanExists = (plans) => {
  // Use map to create an array of planTypes
  const planTypes = plans?.map((plan) => plan.planType);

  // Check if 'fixed' exists in the array of planTypes
  return planTypes?.includes("fixed");
};

export const formatSubscriptionPrice = (price: number) => {
  if (price) {
    return (price / 100).toFixed(2);
  }
};

export const getInitials = (string) => {
  let names = string?.split(" "),
    initials = names?.[0].substring(0, 1).toUpperCase();

  if (names?.length > 1) {
    initials += names[names?.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

export function formatTransactionDateTime(isoString) {
  // Parse the ISO 8601 date string
  const date = new Date(isoString);

  // Extract date components
  const month = date.getMonth() + 1; // Months are zero-indexed
  const day = date.getDate();
  const year = date.getFullYear();

  // Format date as MM/DD/YYYY
  const formattedDate = `${month}/${day}/${year}`;

  // Extract time components
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Determine AM/PM notation
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'

  // Format minutes and seconds with leading zeros if needed
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;

  return {
    transactionDate: formattedDate,
    transactionTime: formattedTime,
  };
}

export const textFormatter = (text: string = "") => {
  return text?.length > 30 ? text?.slice(0, 30) + "..." : text;
};

export const generateRedirectUrl = (notificationPayload) => {
  const type = notificationPayload.type;
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
  switch (type) {
    case "comment":
      return `${baseUrl}post/${notificationPayload.notificationOnPost}`;

    case "like_post":
      return `${baseUrl}post/${notificationPayload.notificationOnPost}`;

    case "like_comment":
      return `${baseUrl}post/${notificationPayload.notificationOnPost}`;

    case "follow":
      return `${baseUrl}${notificationPayload.notificationFromUserDetails}`;

    case "like_story":
      return `${baseUrl}${notificationPayload.notificationFromUserDetails}`;

    default:
      return `${baseUrl}`;
  }
};
