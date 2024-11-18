'use client'
import { Button } from '@/components/ui/button';
import React, { useState } from 'react'
import ShareOthersPopup from './shareOthersPopup';

const ShareOthers = () => {
    const [openShareModel, setOpenShareModel] = useState(false);
  return (
    <>
     <Button onClick={()=>setOpenShareModel(true)}>Click Me</Button>
     <ShareOthersPopup open={openShareModel} setOpenShareModel={setOpenShareModel}/>
     </>
  )
}

export default ShareOthers