import React from 'react'
import { Button } from '@/components/ui/button'
import { useContentUploadContext } from '@/context/open-content-modal'

function UploadContentButton() {
    const {toggleContentUploadOpen} = useContentUploadContext()
  return (
    <div className="flex items-center ">
        <Button
          variant={"link"}
          size={"icon"}
          className="bg-transparent focus:bg-transparent w-24"
          onClick={() => toggleContentUploadOpen(true)}
        >
          <img src="/assets/images/my-Profile/upload-with-border.svg" />
        </Button>
        Upload
      </div>
  )
}

export default UploadContentButton