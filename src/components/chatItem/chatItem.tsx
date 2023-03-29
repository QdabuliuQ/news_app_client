import React, { memo } from 'react'
import "./chatItem.less"

interface IProps {
  id?: string
  img: string
  name: string
  message?: any
  rightSlot?: any
  click?: Function
}

export default memo(function ChatItem(props: IProps) {
  return (
    <div onClick={() => props.click && props.click()} className='ChatItem'>
      <div className='leftImg'>
        <img src={props.img} alt="" />
      </div>
      <div className='rightInfo'>
        <div className='info_name'>
          {props.name}
        </div>
        {
          props.message ? <div className='info_message'>
            {props.message}
          </div> : ''
        }
      </div>
      {
        props.rightSlot
      }
    </div>
  )
}) 
