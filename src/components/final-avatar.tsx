// import Image from "next/image";
import React from "react";

const FinalAvatar = ({ imageSrc, setEdit }: any) => {
  return (
    <div className="flex flex-col justify-center items-center gap-y-12 mt-16">
      <div className="rounded-[20px] border border-[#b913e2] px-20 pb-20">
        <img src={imageSrc} alt="FinalImage" />
      </div>
      <div className="flex gap-x-4">
        <button className="bg-[#b913e2] font-medium text-white text-[16px] lg:text-[20px] py-2 px-10 rounded-full shadow hover:bg-white hover:text-black hover:border-[#b913e2] hover:border-2 transition">
          Save
        </button>
        <button
          onClick={() => {
            setEdit(false);
          }}
          className="border-[2px] font-medium border-[#b913e2] text-[16px] lg:text-[20px] py-2 px-8 rounded-full shadow hover:bg-[#b913e2] transition hover:text-white hover:border-[#b913e2] hover:border-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FinalAvatar;
