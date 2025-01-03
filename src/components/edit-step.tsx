import Image from "next/image";
import React from "react";

const EditStep = ({ title, data, nextButton, index }: any) => {
  return (
    <div className="flex flex-col mx-auto gap-y-12">
      <div className="text-base md:text-lg text-left xl:text-2xl font-medium text-black ">
        {title}
      </div>

      <div className="grid grid-cols-3 gap-8 md:grid-cols-4 lg:grid-cols-6">
        {data?.map((tone: any, i) => (
          <div className="flex flex-col gap-4 items-center" key={i}>
            <Image
              src={tone.imageSrc}
              alt={tone.name}
              width={100}
              height={100}
            />
            {index && (
              <div className="text-sm md:text-base font-medium text-black mb-4">
                {tone.name}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          onClick={nextButton}
          className="bg-[#b913e2] font-medium text-white text-[16px] lg:text-[20px] 2xl:mb-6 py-2 px-12 rounded-full shadow hover:bg-white hover:text-black hover:border-[#b913e2] hover:border-2 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EditStep;
