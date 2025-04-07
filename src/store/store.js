import { configureStore } from '@reduxjs/toolkit'
import authentication from "../Features/counter/authSlice"
// import loginReducer from "../Features/counter/loginSlice"
import creategroup from '../Features/counter/createGroup'
import userProfileReducer from '../Features/counter/getProfile'
import JoinedUsers from '../Features/counter/connectedUsersSlice'
import codereducer from '../Features/counter/coderunnerSlice'
import GroupIdUserName from '../Features/counter/passingGroupId'
import toggleConnectUsers from '../Features/counter/toggleConnectUsers'
import videocontroller from '../Features/counter/videoSlice'
import chatGptReducer from "../Features/counter/chatGpt"
import searchReducer  from "../Features/counter/SearchFeature"
import ReviewReducer from "../Features/counter/reviewSlice"
import callEndSlice from "../Features/counter/callEndSlice"



export const store = configureStore({
  reducer:{
    group:creategroup,
    auth : authentication,
    user : userProfileReducer,
    connectedUsers:JoinedUsers,
    codeexecution:codereducer,
    passingGroupId:GroupIdUserName,
    connectedUsers:toggleConnectUsers,
    videocontroller:videocontroller,
    chatGpt:chatGptReducer,
    searchbar:searchReducer,
    ReviewReducer : ReviewReducer,
    callEndSlice : callEndSlice


  },
})