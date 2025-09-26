"use client";
import React, { useEffect, useMemo, useState } from "react";
import InnerPageHeader from "@/components/shared/inner-page-header";
import { Separator } from "@/components/ui/separator";
import NotificationRow from "@/components/shared/get-notification-description";
import { ABeeZee } from "next/font/google";
import { useGetNotificationQuery } from "@/redux/services/haveme/notifications";
import { useRouter } from "next/navigation";
import { useTypedSelector } from "@/redux/store";
import { selectAllNotifications } from "@/redux/slices/adapters";
import { useInView } from "react-intersection-observer";
import { generateRedirectUrl, baseServerUrl } from "@/lib/utils";

const fontItalic = ABeeZee({ subsets: ["latin"], weight: ["400"], style: "italic" });

type Actor = { id?: string; name?: string; avatar?: string };

function safeParse<T=any>(v: any): T | undefined {
  try {
    if (!v) return undefined as any;
    if (typeof v === 'object') return v as T;
    const s = String(v).trim();
    if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
      return JSON.parse(s) as T;
    }
  } catch {}
  return undefined as any;
}

const Notification = () => {
  const { ref, inView } = useInView();
  const notificationsData = useTypedSelector(selectAllNotifications);
  const [query, setQuery] = useState({ page: 1, perPage: 10 });
  const { data: userNotificationData } = useGetNotificationQuery(query);
  const router = useRouter();

  const loadMoreNotifications = () => {
    if (query?.page >= userNotificationData?.meta?.pageCount) return;
    setQuery((prevQuery) => ({ ...prevQuery, page: prevQuery.page + 1 }));
  };

  useEffect(() => {
    if (inView && query?.page <= userNotificationData?.meta?.pageCount) {
      loadMoreNotifications();
    }
  }, [inView]);

  const notificationAction = (notificationInfo: any) => {
    const urlToOpen = generateRedirectUrl?.(notificationInfo);
    if (!urlToOpen) return;
    try { const u = new URL(urlToOpen); router.push(u.pathname + u.search + u.hash); }
    catch { window.location.href = urlToOpen; }
  };

  // Enrichment caches
  const [actorMap, setActorMap] = useState<Record<string, Actor>>({});
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [assignedCommentIdByNotif, setAssignedCommentIdByNotif] = useState<Record<string, string>>({});

  // Collect missing ids whenever notifications change
  useEffect(() => {
    const actors = new Set<string>();
    const mediaIds = new Set<string>();
    notificationsData?.forEach((n: any) => {
      const actorObj = safeParse(n?.notificationFromUserDetails);
      // Actor id or username can come from: embedded object, string username/id, or parsed from title/description
      const parsedName = (!n?.notificationFromUserDetails && (n?.description || n?.title)) ? (n?.description || n?.title) : undefined;
      const nameFromText = parsedName ? (parsedName.match(/^([^\s]+)\s+(commented|liked|started)/i)?.[1]) : undefined;
      const candidate = actorObj?._id || actorObj?.id || (typeof n?.notificationFromUserDetails === 'string' ? String(n?.notificationFromUserDetails) : (nameFromText || ""));
      const aid = candidate;
      if (aid && !actorMap[aid]) actors.add(aid);
      const postObj = safeParse(n?.notificationOnPost);
      const pid = postObj?._id || (typeof n?.notificationOnPost === 'string' ? String(n?.notificationOnPost) : "");
      if (pid && !mediaMap[pid]) mediaIds.add(pid);
    });

    const fetchActors = async () => {
      await Promise.all(Array.from(actors).map(async (id) => {
        try {
          const isObjectId = /^[a-f0-9]{24}$/i.test(id);
          const tryUrls: string[] = [];
          if (isObjectId) tryUrls.push(`${baseServerUrl}/v1/user/${id}`);
          else {
            tryUrls.push(`${baseServerUrl}/v1/user/find?userName=${encodeURIComponent(id)}`);
            tryUrls.push(`${baseServerUrl}/v1/user/find?userName=${encodeURIComponent(String(id).toLowerCase())}`);
          }
          let data: any = null;
          for (const url of tryUrls) {
            try {
              const r = await fetch(url, { credentials: 'include' });
              if (!r.ok) continue;
              const j = await r.json();
              data = j?.data || null;
              if (data) break;
            } catch {}
          }
          if (!data) return;
          let raw = data?.photo?.path || data?.photoPath || data?.userPhoto?.[0]?.path;
          // Resolve via file id if only id is provided
          const fileId = (!raw && typeof data?.photoId === 'string') ? data.photoId : undefined;
          if (!raw && fileId) {
            try {
              const rf = await fetch(`${baseServerUrl}/v1/user/files/${fileId}`, { credentials: 'include' });
              const jf = await rf.json();
              raw = jf?.path || jf?.data?.path || raw;
            } catch {}
          }
          const avatar = raw ? (String(raw).startsWith('http') ? String(raw) : `${baseServerUrl}/${raw}`) : undefined;
          setActorMap((m) => ({
            ...m,
            [id]: { id, name: data?.fullName || data?.userName, avatar },
            [String(id).toLowerCase()]: { id, name: data?.fullName || data?.userName, avatar },
          }));
        } catch {}
      }));
    };

    const fetchMedia = async () => {
      await Promise.all(Array.from(mediaIds).map(async (pid) => {
        try {
          const r = await fetch(`${baseServerUrl}/v1/post/${pid}`, { credentials: 'include' });
          const j = await r.json();
          const mf = j?.mediaFiles || j?.data?.mediaFiles;
          const path = Array.isArray(mf) && mf[0]?.path;
          if (path) setMediaMap((m) => ({ ...m, [pid]: `${baseServerUrl}/${path}` }));
        } catch {}
      }));
    };

    if (actors.size) fetchActors();
    if (mediaIds.size) fetchMedia();
  }, [notificationsData]);

  const items = useMemo(() => notificationsData?.filter((n:any)=> {
    const t = String(n?.type || '').toLowerCase();
    return t === 'follow' || t === 'like_post' || t.includes('comment');
  }) || [], [notificationsData]);

  // Fetch missing comment texts: by explicit commentId when present, or by guessing from actor when only postId is present
  useEffect(() => {
    const toFetchById: { key: string; postId: string; commentId: string }[] = [];
    const toGuessByActor: { notifId: string; postId: string; actorTag: string; createdAt?: string }[] = [];
    items.forEach((n:any) => {
      if (!String(n?.type).toLowerCase().includes('comment')) return;
      const inline = resolveCommentText(n);
      if (inline) return; // already have text inline
      const cid = n?.commentId || n?.notificationOnComment || undefined;
      const pid = typeof n?.notificationOnPost === 'string' ? n?.notificationOnPost : (safeParse(n?.notificationOnPost)?._id);
      if (!pid) return;
      if (cid) {
        const key = `${pid}:${cid}`;
        if (!commentMap[key]) toFetchById.push({ key, postId: String(pid), commentId: String(cid) });
      } else {
        if (!commentMap[n?._id]) {
          // derive actor from explicit field or from description/title fallback
          const fromField = typeof n?.notificationFromUserDetails === 'string' ? n?.notificationFromUserDetails : '';
          const fromText = (n?.description || n?.title) ? ((n?.description || n?.title).match(/^([^\s]+)\s+(commented|liked|started)/i)?.[1] || '') : '';
          const actorTag = fromField || fromText;
          toGuessByActor.push({ notifId: String(n?._id), postId: String(pid), actorTag, createdAt: n?.createdAt });
        }
      }
    });
    if (!toFetchById.length && !toGuessByActor.length) return;
    (async () => {
      // Resolve by explicit comment id
      await Promise.all(toFetchById.map(async ({ key, postId, commentId }) => {
        try {
          let fetched: string | undefined;
          // Preferred: interaction route used in FE services
          try {
            const r = await fetch(`${baseServerUrl}/v1/interaction/comments/${postId}`, { credentials: 'include' });
            const j = await r.json();
            const list = j?.data || j || [];
            const found = Array.isArray(list) ? list.find((c:any)=> String(c?._id) === String(commentId)) : undefined;
            fetched = found?.comment;
          } catch {}
          // Fallbacks
          if (!fetched) {
            // Try non-v1 interaction route
            try {
              const r0 = await fetch(`${baseServerUrl}/interaction/comments/${postId}`, { credentials: 'include' });
              const j0 = await r0.json();
              const list0 = j0?.data || j0 || [];
              const found0 = Array.isArray(list0) ? list0.find((c:any)=> String(c?._id) === String(commentId)) : undefined;
              fetched = found0?.comment || fetched;
            } catch {}
          }
          if (!fetched) {
            for (const ep of [`${baseServerUrl}/v1/comments/${commentId}`, `${baseServerUrl}/v1/comment/${commentId}`]) {
              try {
                const r2 = await fetch(ep, { credentials: 'include' });
                if (r2.ok) {
                  const j2 = await r2.json();
                  fetched = j2?.data?.comment || j2?.comment;
                  if (fetched) break;
                }
              } catch {}
            }
          }
          if (fetched) setCommentMap((m)=> ({ ...m, [key]: fetched as string }));
        } catch {}
      }));

      // Guess by actor on the post's comments
      // Choose the closest-in-time comment by that actor and avoid reusing a comment for multiple notifications
      const locallyChosen = new Set<string>();
      await Promise.all(toGuessByActor.map(async ({ notifId, postId, actorTag, createdAt }) => {
        try {
          let list: any[] = [];
          try {
            const r1 = await fetch(`${baseServerUrl}/v1/interaction/comments/${postId}`, { credentials: 'include' });
            const j1 = await r1.json();
            list = Array.isArray(j1?.data) ? j1.data : (Array.isArray(j1) ? j1 : []);
          } catch {}
          if (!list.length) {
            try {
              const r0 = await fetch(`${baseServerUrl}/interaction/comments/${postId}`, { credentials: 'include' });
              const j0 = await r0.json();
              list = Array.isArray(j0?.data) ? j0.data : (Array.isArray(j0) ? j0 : []);
            } catch {}
          }
          if (Array.isArray(list) && list.length) {
            // Match by interactedBy.userName or interactedBy.fullName
            const lower = (s:string)=> String(s||'').toLowerCase();
            const byActor = list.filter((c:any)=> lower(c?.interactedBy?.userName) === lower(actorTag) || lower(c?.interactedBy?.fullName) === lower(actorTag));
            if (byActor.length) {
              const notifTs = createdAt ? new Date(createdAt).getTime() : Number.MAX_SAFE_INTEGER;
              const alreadyUsed = new Set<string>([
                ...Object.values(assignedCommentIdByNotif),
                ...locallyChosen,
              ]);
              // Prefer comments at or before notification time; pick closest not already used
              const sorted = byActor.slice().sort((a:any,b:any)=> new Date(a?.createdAt||0).getTime() - new Date(b?.createdAt||0).getTime());
              let candidate: any = undefined;
              let bestDiff = Number.POSITIVE_INFINITY;
              for (const c of sorted) {
                const cid = String(c?._id || '');
                if (!cid || alreadyUsed.has(cid)) continue;
                const ct = new Date(c?.createdAt || 0).getTime();
                const diff = notifTs >= ct ? (notifTs - ct) : (ct - notifTs + 1e9); // penalize future comments
                if (diff < bestDiff) { bestDiff = diff; candidate = c; }
              }
              // Fallback: first not-used
              if (!candidate) candidate = sorted.find((c:any)=> !alreadyUsed.has(String(c?._id||'')));
              if (candidate) {
                const text = (candidate?.comment || candidate?.description || '') as string;
                const cid = String(candidate?._id || '');
                if (text) setCommentMap((m)=> ({ ...m, [notifId]: text }));
                if (cid) locallyChosen.add(cid);
                if (cid) setAssignedCommentIdByNotif((m)=> ({ ...m, [notifId]: cid }));
              }
            }
          }
        } catch {}
      }));
    })();
  }, [items]);

  const resolveActor = (n: any): Actor => {
    const inline = safeParse(n?.notificationFromUserDetails) as any;
    if (inline) {
      const raw = inline?.photo?.path || inline?.photoPath || inline?.userPhoto?.[0]?.path || inline?.photoId;
      const avatar = raw ? (String(raw).startsWith('http') ? String(raw) : `${baseServerUrl}/${raw}`) : undefined;
      return { id: inline?._id || inline?.id, name: inline?.fullName || inline?.userName, avatar };
    }
    const id = typeof n?.notificationFromUserDetails === 'string' ? String(n?.notificationFromUserDetails) : undefined;
    const nameFromText = (n?.description || n?.title) ? ((n?.description || n?.title).match(/^(\S+)\s+(commented|liked|started)/i)?.[1] || undefined) : undefined;
    const key = id || nameFromText;
    if (key) {
      const hit = actorMap[key] || actorMap[String(key).toLowerCase()];
      if (hit) return hit;
      return { id: key, name: key };
    }
    return { id };
  };

  const resolveMedia = (n: any): string | undefined => {
    const inline = safeParse(n?.notificationOnPost) as any;
    if (inline) {
      const path = inline?.mediaFiles?.[0]?.path;
      return path ? `${baseServerUrl}/${path}` : undefined;
    }
    const id = typeof n?.notificationOnPost === 'string' ? String(n?.notificationOnPost) : undefined;
    return id ? mediaMap[id] : undefined;
  };

  const resolveCommentText = (n:any): string | undefined => {
    if (!String(n?.type).toLowerCase().includes('comment')) return undefined;
    const primary = n?.commentText || n?.comment || n?.text || n?.body;
    return primary || undefined;
  };

  const extractNameFromText = (s?: string): string | undefined => {
    if (!s) return undefined;
    const m = s.match(/^(.+?)\s+(commented|liked|started)/i);
    return m?.[1];
  };

  return (
    <div>
      <InnerPageHeader showBackButton={false} title="Notifications" />
      <Separator />
      <div className="p-6">
        <div className={`pl-1 text-lg ${fontItalic.className}`}>
          <p>Today</p>
        </div>
        {items.map((n: any) => {
          const actor = resolveActor(n);
          const media = resolveMedia(n);
          const commentKey = String((typeof n?.notificationOnPost==='string'?n?.notificationOnPost:(safeParse(n?.notificationOnPost)?._id)))+':'+String(n?.commentId || n?.notificationOnComment || '');
          const fetchedText = commentMap[commentKey] || commentMap[String(n?._id)];
          const nameFallback = extractNameFromText(n?.title) || extractNameFromText(n?.description);
          const displayName = actor?.name || nameFallback || 'User';
          return (
            <div className="p-2 cursor-pointer" key={n._id} onClick={() => notificationAction(n)}>
              <NotificationRow
                actorAvatar={actor?.avatar}
                actorName={displayName}
                verb={n?.type}
                text={fetchedText || resolveCommentText(n)}
                mediaThumb={media}
              />
            </div>
          );
        })}
        <div ref={ref}></div>
      </div>
    </div>
  );
};

export default Notification;
