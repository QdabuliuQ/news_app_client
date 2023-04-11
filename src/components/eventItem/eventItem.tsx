import React, { memo, useEffect } from 'react'
import { Image, ImagePreview, Toast, Typography } from 'react-vant'
import { useRouter } from '@/hooks/useRouter';
import { praiseEvent } from '@/network/eventDetailView/eventDetailView';
import ArticleItem from "@/components/replyCom/articleItem/articleItem";
import VideoItem from "@/components/replyCom/videoItem/videoItem";
import ReplyItem from "@/components/replyCom/replyItem/replyItem";
import ReplyData from "@/components/replyCom/replyData/replyData";
import "./eventItem.less"

interface IProps {
  ev_id: string
  user_id: string
  nickname: string
  user_pic: string
  time: number
  type: string
  content: string
  images: { link: string }[]
  resource_id: string
  resource_info: any
  commentCount: number
  is_praise: number
  praise_count: number
}

export default memo(function EventItem(props: IProps) {
  let images: string[] = []
  const { router } = useRouter()

  const imgClick = (e: any, idx: number) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    ImagePreview.open({ images, startPosition: idx  })
  }

  const toDetail = () => {
    sessionStorage.setItem('event', JSON.stringify(props))
    router('/eventDetail/'+props.ev_id)
  }

  const praiseCB = (data: any, cb: Function) => {
    praiseEvent({
      ev_id: props.ev_id,
      is_praise: data.pState
    }).then((res: any) => {
      if(res.status) return Toast.fail(res.msg)
      let eventData = {
        ...props
      }
      eventData.is_praise = data.pState
      eventData.praise_count = data.pState ? eventData.praise_count + 1 : eventData.praise_count-1
      sessionStorage.removeItem('event')
      sessionStorage.setItem('event', JSON.stringify(eventData))
      cb()
    })
  }

  useEffect(() => {
    if (props.images) {
      for (let item of props.images) {
        images.push(item.link)
      }
    }
  }, [props.images])

  return (
    <div onClick={toDetail} className='EventItem'>
      <div className='userInfo'>
        <Image round fit='cover' src={props.user_pic} />
        <div className='userData'>
          <div className='nickname'>
            {props.nickname}
            <span className='type'>
              {
                props.type == '1' ? '发布动态'
                  : props.type == '2' ? '分享文章'
                    : props.type == '3' ? '分享视频'
                      : '转发动态'
              }
            </span>
          </div>
          <div className='pubTime'>
            {(React as any).$moment(props.time).format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>
      </div>
      <div className='eventInfo'>
        {
          props.content ? <div className='eventContent'>
            <Typography.Text
              ellipsis={{
                rows: 4,
                collapseText: '收起',
                expandText: '展开',
              }}
            >
              {props.content}
            </Typography.Text>
          </div> : ''
        }
        {
          props.images ? <div className='eventImages'>
            {
              props.images.map((item, index) => (
                <Image key={item.link} onClick={(e) => imgClick(e, index)} fit='cover' src={item.link} />
              ))
            }
          </div> : ''
        }
        {
          props.resource_info == -1 ? (
            <div className='emptyContent'>内容以删除</div>
          ) : props.resource_info && props.type == '2' ?
            <ArticleItem
              cover_img={props.resource_info.cover_img}
              title={props.resource_info.title}
              pub_date={props.resource_info.pub_date}
              content={props.resource_info.content}
              id={props.resource_info.id}
              toDetail={true}
            />
            : props.resource_info && props.type == '3' ? <VideoItem
              id={props.resource_info.id}
              cover_img={props.resource_info.cover_img}
              time={props.resource_info.time}
              title={props.resource_info.title}
              toDetail={true}
            /> : props.resource_info && props.type == '4' ? <ReplyItem {...props.resource_info}/> : ''
        }
        <ReplyData 
          praiseCount={props.praise_count}
          isPraise={props.is_praise}
          commentCount={props.commentCount}
          replyCount={0}
          praiseCB={praiseCB}
        />
      </div>
    </div>
  )
}) 
