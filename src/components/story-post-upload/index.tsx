import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudUpload } from "lucide-react";
import { useRouter } from "next/navigation";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const StoryPostUploadForm = () => {
  const [fileSelected, setFileSelected] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [fileURL, setFileURL] = useState<string>("");
  const router = useRouter();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result;
        setFileSelected(true);
        setFile(selectedFile);
        setFileType(selectedFile.type);
        setFileURL(URL.createObjectURL(selectedFile));
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFileSelected(false);
      setFile(null);
      setFileType("");
      setFileURL("");
    }
  };

  const handleUploadButtonClick = () => {
    const fileInput = document.getElementById("file-input");
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleUpload = () => {
    if (file) {
      // Your upload logic here
      router.push("/post-preview");
    } else {
      const fileInput = document.getElementById("file-input");
      if (fileInput) {
        fileInput.click();
      }
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-center w-full cursor-pointer p-4 flex-col">
        {fileSelected ? (
          <div className="flex w-full justify-center mb-4">
            {fileType.startsWith("image") ? (
              <img
                src={fileURL}
                alt="Preview"
                className="w-40 h-40 rounded-full"
              />
            ) : fileType.startsWith("video") ? (
              <video src={fileURL} className="h-auto" controls></video>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2" onClick={handleUploadButtonClick}>
            <div className="w-full flex flex-col justify-center">
              <CloudUpload className="text-primary w-full justify-center" />
              <p
                className={` text-center mt-2 leading-4 pb-2 ${fontItalic.className}`}
              >
                Support jpg, jpeg, png, and mp4 <br />
              </p>
              <p
                className={` text-center leading-4 pb-4 ${fontItalic.className}`}
              >
                formats up to 5mb
              </p>
            </div>
            <Input
              id="file-input"
              style={{ display: "none" }}
              type="file"
              accept="video/*,image/png, image/gif, image/jpeg"
              onChange={handleFileChange}
            />
          </div>
        )}
        <div className="w-full flex justify-center">
          <Button type="button" onClick={handleUpload} className="w-3/4">
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryPostUploadForm;
