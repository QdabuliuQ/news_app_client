import React from 'react'
import { useNavigate } from "react-router-dom";
import { Search, AddO } from '@react-vant/icons';
import "./videoNav.less"

export default function VideoNav() {
  const router = useNavigate()

  return (
    <div id='VideoNav'>
      <Search onClick={() => router('/search')} color='#f0f0f0' />
      <AddO onClick={() => router('/pubVideo')} color='#f0f0f0' />
    </div>
  )
}
