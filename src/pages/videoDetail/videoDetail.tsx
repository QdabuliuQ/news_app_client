import React, { useEffect, useState } from 'react'
import PubSub from 'pubsub-js';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionSheet, Button, Empty, Input, ShareSheet, Toast } from 'react-vant';
import { ArrowLeft, WarnO } from '@react-vant/icons';
import { pubVideoComment, getVideoComment } from "@/network/videoView/videoView";
import { getVideoDetail } from "@/network/videoDetail/videoDetail";
import CommentItem from "@/components/commentItem/commentItem";
import ScrollList from '@/components/scrollList/scrollList';
import VideoContent from "@/pages/videoView/videoContent/videoContent";
import { add_message_info } from '@/reduxs/actions/message';
import { add_event_info } from '@/reduxs/actions/event';
import { useDispatch } from 'react-redux';
import "./videoDetail.less"


export default function VideoDetail() {
  const router = useNavigate()
  const dispatch = useDispatch()
  const options = [
    { name: '分享', icon: <div className='videoActionMenuItem'><img src={require("@/assets/images/event.png")} alt="" /></div> },
    { name: '转发', icon: <div className='videoActionMenuItem'><img src={require("@/assets/images/send.png")} alt="" /></div> },
    { name: '举报', icon: <div className='videoActionMenuItem'><img src={require("@/assets/images/report.png")} alt="" /></div> },
  ]
  const [sheetVisible, setSheetVisible] = useState(false)
  const [visible, setVisible] = useState(false)
  const { id } = useParams()
  const [status, setStatus] = useState(0)
  const [info, setInfo] = useState<any>(null)
  const [val, setVal] = useState('')
  const [commentOffset, setCommentOffset] = useState(1)
  const [commentMore, setCommentMore] = useState(true)
  const [commentList, setCommentList] = useState<{
    comment_id: string
    content: string
    is_delete: string
    nickname: string
    time: number
    user_id: string
    user_pic: string
    video_id: string
    praise_count: number
    is_praise: number
  }[]>([])

  // 获取评论数据
  const getCommentData = (offset?: number) => {
    let _offset = offset ? offset : commentOffset
    getVideoComment({
      video_id: id as string,
      offset: _offset,
    }).then((res: any) => {
      if (res.status) {
        return Toast.fail('获取失败')
      }
      if (_offset == 1) {
        setCommentList(res.data)
      } else {
        setCommentList([...commentList, ...res.data])
      }
      setCommentMore(res.more)
      setCommentOffset(commentOffset + 1)
    })
  }

  // 发送评论
  const pubComment = () => {
    let content = val.trim()
    if (content.length > 100) {
      Toast.fail('内容不能超过100个字')
    }
    pubVideoComment({
      video_id: id as string,
      content,
    }).then((res: any) => {
      if (res.status) {
        return Toast.fail(res.msg)
      }
      setCommentOffset(1)
      getCommentData(1)
      Toast.success(res.msg)

      setVal('')
    })
  }

  useEffect(() => {
    getVideoDetail({
      id: id as string
    }).then((res: any) => {
      if (res.status) {
        setStatus(res.status)
        return Toast.fail('网络错误')
      }
      setInfo(res.data)
    })


    // 消息订阅
    PubSub.subscribe('commentDetail', (msg: string, id: string) => {
      setCommentOffset(1)
      setCommentMore(true)
      getCommentData(1)
      setVisible(true)
    })
    PubSub.subscribe('moreEvent', (msg: string, id: string) => {
      setSheetVisible(true)
    })
  }, [])

  return (
    <div id='VideoDetail'>
      <ShareSheet
        visible={sheetVisible}
        options={options}
        onCancel={() => setSheetVisible(false)}
        onSelect={(option, index) => {
          switch (index) {
            case 0:
              dispatch(add_event_info({
                type: '3',
                resource_info: info
              }))
              router(`/pubEvent`)
              break;
            case 1:
              dispatch(add_message_info({  // 存入 redux 当中
                type: '3',
                resource_info: info
              }))
              router(`/sendList`)
              break;
            case 2:
              router(`/report/${id}/2`)
              break;
          }
          setVisible(false)
        }}
      />
      <ActionSheet closeable={false} title='视频评论' visible={visible} onCancel={() => setVisible(false)}>
        {
          commentList.length ? (
            <ScrollList
              cb={() => {
                getCommentData()
              }}
              hasMore={commentMore}
              height={'60vh'}
            >
              <div style={{ padding: '5vw 4vw' }}>
                {
                  commentList.map(item => (
                    <CommentItem
                      key={item.comment_id}
                      content={item.content}
                      time={item.time}
                      nickname={item.nickname}
                      user_pic={item.user_pic}
                      comment_id={item.comment_id}
                      user_id={item.user_id}
                      video_id={item.video_id}
                      showReply={false}
                      click={false}
                      praise={item.praise_count}
                      is_praise={item.is_praise}
                      type='2'
                    />
                  ))
                }
              </div>
            </ScrollList>
          ) : (
            <div style={{ height: '60vh' }}>
              <Empty description="暂无评论内容" />
            </div>
          )
        }
        <div style={{
          padding: '2vw 3vw',
          boxShadow: '0 -1px 17px 0 rgba(0,0,0,.1)'
        }}>
          <Input
            value={val}
            maxLength={100}
            onChange={setVal}
            suffix={<Button onClick={pubComment} round size="small" type="primary">发送</Button>}
            placeholder="请输入评论内容"
          />
        </div>
      </ActionSheet>
      <div className='videoNav'>
        <ArrowLeft onClick={() => router(-1)} color='#f0f0f0' />
      </div>
      {
        status == 1 ? (
          <div className='errorView'>
            <Empty image='error' description="获取视频失败" />
          </div>
        ) : (
          <VideoContent
            isPlay={true}
            {...info} />
        )
      }
    </div>
  )
}
