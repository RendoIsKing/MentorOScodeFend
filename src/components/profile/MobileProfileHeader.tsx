import Image from "next/image";

export default function MobileProfileHeader({ user }: { user: any }) {
  const name = user?.fullName || user?.userName || "Profile";
  const handle = user?.handle ? `@${user.handle}` : user?.userName ? `@${user.userName}` : "";

  return (
    <section className="md:hidden">
      <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden">
        {user?.cover?.url && (
          <Image src={user.cover.url} alt="" fill className="object-cover" priority />
        )}
      </div>

      <div className="px-4 -mt-10">
        <div className="flex items-end gap-3">
          <div className="relative h-20 w-20 rounded-full ring-4 ring-background overflow-hidden bg-muted">
            <Image
              src={user?.photo?.url || "/avatar-fallback.png"}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 pb-2">
            <div className="text-lg font-semibold leading-tight">{name}</div>
            <div className="text-sm text-muted-foreground">{handle}</div>
          </div>
          <div className="pb-2">
            <button className="rounded-lg border px-3 h-9">Edit</button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 text-center">
          <div><div className="text-base font-semibold">{user?.stats?.followers ?? 0}</div><div className="text-xs text-muted-foreground">Followers</div></div>
          <div><div className="text-base font-semibold">{user?.stats?.likes ?? 0}</div><div className="text-xs text-muted-foreground">Likes</div></div>
          <div><div className="text-base font-semibold">{user?.stats?.posts ?? 0}</div><div className="text-xs text-muted-foreground">Posts</div></div>
        </div>

        {user?.bio && <p className="mt-3 text-sm leading-relaxed">{user.bio}</p>}
      </div>
    </section>
  );
}


