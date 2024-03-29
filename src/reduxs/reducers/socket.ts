
import { ActionInt } from "@/interface/global";
import { 
  INIT_SOCKET ,
  DELETE_SOCKET
} from "../constants";

// reducer函数
export default function socket(state: any = null, action: ActionInt) {
  const {
    type,
    data
  } = action

  switch (type) {
    case INIT_SOCKET:
      return data
    case DELETE_SOCKET:
      return null
    default:
      return state;  
  }
}