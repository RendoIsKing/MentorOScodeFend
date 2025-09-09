"use client";
import { useRef, useState } from "react";
import { useUploadFileMutation } from "@/redux/services/haveme";
import { useUpdateMeMutation } from "@/redux/services/haveme/user";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
const Cropper = dynamic(()=> import('react-easy-crop'), { ssr: false }) as any;

export default function MobileAvatarCoverPickers({ user, inline }: { user: any; inline?: boolean }) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef  = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"avatar" | "cover" | null>(null);
  const [uploadFile] = useUploadFileMutation();
  const [updateMe] = useUpdateMeMutation();
  const { toast } = useToast();
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropKind, setCropKind] = useState<"avatar"|"cover"|null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>, kind: "avatar"|"cover") {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show cropper first
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCropKind(kind);
    };
    reader.readAsDataURL(file);
  }

  async function onConfirmCrop(){
    if (!cropSrc || !cropKind) return;
    setBusy(cropKind);
    try{
      // Convert cropped area to blob
      const image = await createImage(cropSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const { width, height, x, y } = croppedAreaPixels;
      canvas.width = width; canvas.height = height;
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
      const blob: Blob = await new Promise(resolve=> canvas.toBlob(b=> resolve(b!), 'image/jpeg', 0.92));
      const form = new FormData(); form.append('file', blob, 'crop.jpg');
      const res: any = await uploadFile(form);
      const fileId = res?.data?.id || res?.file?.data?.id || res?.id;
      if (!fileId) throw new Error('Upload response missing file id');
      await updateMe(cropKind === 'avatar' ? { photoId: fileId } : { coverPhotoId: fileId }).unwrap();
      toast({ description: cropKind === 'avatar' ? 'Profile photo updated' : 'Cover photo updated' });
      setCropSrc(null); setCropKind(null);
      try { window.location.reload(); } catch {}
    }catch(err:any){
      toast({ variant:'destructive', description: err?.message || 'Failed to update image' });
    }finally{
      setBusy(null);
    }
  }

  function onCropComplete(_: any, areaPixels: any){ setCroppedAreaPixels(areaPixels); }

  function createImage(url:string): Promise<HTMLImageElement>{
    return new Promise((resolve, reject)=>{ const img = new Image(); img.crossOrigin='anonymous'; img.onload=()=>resolve(img); img.onerror=reject; img.src=url; });
  }

  return (
    <>
      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e)=>handleChange(e,"avatar")} />
      <input ref={coverRef}  type="file" accept="image/*" className="hidden" onChange={(e)=>handleChange(e,"cover")} />

      {inline ? (
        <div className="px-4 pt-2 pb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={()=> avatarRef.current?.click()}
            className="h-9 rounded-full border px-3 text-sm"
            disabled={busy==="avatar"}
          >
            {busy==="avatar" ? "Uploading…" : "Change Avatar"}
          </button>
          <button
            type="button"
            onClick={()=> coverRef.current?.click()}
            className="h-9 rounded-full border px-3 text-sm"
            disabled={busy==="cover"}
          >
            {busy==="cover" ? "Uploading…" : "Change Cover"}
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={()=> avatarRef.current?.click()}
            className="absolute left-3 bottom-3 z-20 pointer-events-auto h-9 min-w-[110px] rounded-full border bg-background/80 backdrop-blur px-3 text-sm"
            disabled={busy==="avatar"}
          >
            {busy==="avatar" ? "Uploading…" : "Change Avatar"}
          </button>
          <button
            type="button"
            onClick={()=> coverRef.current?.click()}
            className="absolute right-3 bottom-3 z-20 pointer-events-auto h-9 min-w-[110px] rounded-full border bg-background/80 backdrop-blur px-3 text-sm"
            disabled={busy==="cover"}
          >
            {busy==="cover" ? "Uploading…" : "Change Cover"}
          </button>
        </>
      )}

      {cropSrc && (
        <div className="fixed inset-0 z-[10060] bg-black/80 flex flex-col">
          <div className="relative flex-1">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={cropKind==='avatar' ? 1 : 16/9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="p-3 flex items-center justify-between bg-background">
            <button onClick={()=>{ setCropSrc(null); setCropKind(null); }} className="h-10 px-4 rounded-full border">Cancel</button>
            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e)=>setZoom(parseFloat(e.target.value))} className="mx-3 flex-1" />
            <button onClick={onConfirmCrop} disabled={!!busy} className="h-10 px-4 rounded-full bg-primary text-primary-foreground">Use Photo</button>
          </div>
        </div>
      )}
    </>
  );
}


