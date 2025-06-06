/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Avatar,
  TouchableOpacity,
  Icon,
  Colors,
} from 'react-native-ui-lib';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  useNavigation,
  useRoute,
  NavigationProp,
  RouteProp,
} from '@react-navigation/native';

import {
  getInitialNotification,
  getMessaging,
} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';
import {showEditor} from 'react-native-video-trim';
import {Asset} from 'react-native-image-picker';
import {ScrollView} from 'react-native';
import RNFS from 'react-native-fs';

import PostForm from './PostForm';
import {AppDispatch, RootState} from '../../redux/store';
import {logout} from '../../redux/slice/user.slice';
import {nav} from '../../navigation/navName';
import {selectMedia} from '../../util/selectImage';
import {clearAppCache} from '../../util/uploadImage';
import {handleNotificationClick} from '../../services/Notification';
import {getAccountInfo, getToken} from '../../redux/action/user.action';
import {setMessage, setTask} from '../../redux/slice/message.slice';
import {clearPostMoment} from '../../redux/slice/postMoment.slice';
import {deleteAllMp4Files} from '../../util/uploadVideo';
import useTrimVideo from '../../hooks/useTrimVideo';
import SelectFriendDialog from '../../Dialog/SelectFriendDialog';
import SelectMediaDialog from '../../Dialog/SelectMediaDialog';
import {
  uploadImageToFirebaseStorage,
  uploadVideoToFirebase,
} from '../../redux/action/postMoment.action';

let navigation: NavigationProp<any>;

interface RouteParams {
  from?: string;
  uri?: string;
  camera?: any;
}

interface MediaType {
  uri: string;
  type?: string;
}

const HomeScreen = () => {
  const messaging = getMessaging(getApp());
  const dispatch = useDispatch<AppDispatch>();
  navigation = useNavigation();
  const route = useRoute<RouteProp<{params: RouteParams}>>();

  //redux state
  const {user, userInfo} = useSelector((state: RootState) => state.user);
  const {postMoment, isLoading} = useSelector(
    (state: RootState) => state.postMoment,
  );
  const {useCamera, unlimitedTrimVideo} = useSelector(
    (state: RootState) => state.setting,
  );
  const {selected, optionSend, customListFriends} = useSelector(
    (state: RootState) => state.friends,
  );

  //use state
  const [selectedMedia, setselectedMedia] = useState<MediaType | null>(null);
  const [caption, setCaption] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [visibleSelectMedia, setVisibleSelectMedia] = useState(false);
  const [visibleSelectFriend, setVisibleSelectFriend] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    getInitialNotification(messaging).then(async remoteMessage => {
      handleNotificationClick(remoteMessage?.data || {});
    });

    if (user?.timeExpires && +user.timeExpires < new Date().getTime()) {
      dispatch(
        getToken({
          refreshToken: user.refreshToken || '',
        }),
      );
    } else {
      if (user) {
        console.log('get account info');

        dispatch(
          getAccountInfo({
            idToken: user.idToken || '',
            refreshToken: user.refreshToken || '',
          }),
        );
      }
    }
  }, []);

  // Lắng nghe sự kiện khi cắt ảnh xong
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      switch (route.params?.from) {
        case nav.crop:
          if (route.params?.uri) {
            setselectedMedia({uri: route.params.uri});
            navigation.setParams(undefined);
          }
          break;
        case nav.camera:
          console.log(route.params);

          if (route.params?.camera) {
            compressMedia(route.params.camera);
            navigation.setParams(undefined);
          }
          break;

        default:
          navigation.setParams(undefined);
          break;
      }
    });

    return unsubscribe; // Hủy đăng ký listener khi component unmount
  }, [navigation, route]);

  //event đăng xuất
  const handleLogout = () => {
    dispatch(logout());
  };

  //kiểm tra cài đặt, nếu có bật cho phép chụp ảnh từ camera thì thêm option chụp ảnh nữa
  const handleSelectMedia = async () => {
    if (useCamera) {
      setVisibleSelectMedia(true);
    } else {
      await handleConfirmSelectMedia('gallery');
    }
  };

  //event bỏ loại bỏ media
  const handleRemoveMedia = () => {
    setselectedMedia(null);
  };

  //event nhấn xem profile
  const handleViewProfile = () => {
    navigation.navigate(nav.accountInfo);
  };

  //event post moment
  const handlePost = async () => {
    if (!user) {
      return;
    }

    if (selectedMedia?.type === 'video') {
      const task = dispatch(
        uploadVideoToFirebase({
          idUser: user.localId,
          idToken: user.idToken,
          videoInfo: selectedMedia.uri,
          caption,
          refreshToken: user.refreshToken,
          friend:
            optionSend === 'all'
              ? []
              : optionSend === 'custom_list'
              ? customListFriends
              : selected,
        }),
      );

      dispatch(setTask(task));
    } else {
      const task = dispatch(
        uploadImageToFirebaseStorage({
          idUser: user.localId,
          idToken: user.idToken,
          imageInfo: selectedMedia,
          caption,
          refreshToken: user.refreshToken,
          friend:
            optionSend === 'all'
              ? []
              : optionSend === 'custom_list'
              ? customListFriends
              : selected,
        }),
      );

      dispatch(setTask(task));
    }
  };

  //event hủy chọn
  const handleCancelSelectMedia = () => {
    setVisibleSelectMedia(false);
  };

  //event chọn cách lấy file media (thư viện, camera)
  const handleConfirmSelectMedia = async (value: 'gallery' | 'camera') => {
    setLocalLoading(true);
    await onSelectMedia(value);
    setLocalLoading(false);
  };

  //xử lý option sau khi chọn
  const onSelectMedia = async (from: 'gallery' | 'camera') => {
    let result;
    if (from === 'gallery') {
      result = await selectMedia();
      if (result) {
        compressMedia(result[0]);
      }
    } else if (from === 'camera') {
      navigationTo(nav.camera);
    } else {
      return;
    }
  };

  //xử lý cắt ngắn video sau khi chọn xong
  const compressMedia = (media: Asset) => {
    setselectedMedia(null);

    if (media?.type?.startsWith('image')) {
      setIsVideo(false);
      navigation.navigate(nav.crop, {
        imageUri: media.uri,
      });
    } else if (media?.type?.startsWith('video')) {
      if (media.uri) {
        showEditor(media.uri, {
          maxDuration: unlimitedTrimVideo ? undefined : 7,
          saveButtonText: 'Lưu',
          cancelButtonText: 'Hủy',
          autoplay: true,
          cancelDialogMessage: 'Bạn có muốn hủy cắt video không?',
          cancelDialogConfirmText: 'Có',
          cancelDialogCancelText: 'Không',
          enableSaveDialog: false,
          enableHapticFeedback: true,
          type: 'video',
          trimmingText: 'Đang xử lý...',
          alertOnFailToLoad: true,
        });
        setIsVideo(true);
        return;
      }
    }
  };

  //sau khi postmoment xong thì xử lý ở đây
  useEffect(() => {
    if (postMoment) {
      dispatch(
        setMessage({
          message: postMoment,
          type: 'Success',
        }),
      );
      dispatch(clearPostMoment());
      setselectedMedia(null);

      //xóa cache của app sau khi upload thành công
      clearAppCache();
      deleteAllMp4Files(RNFS.DocumentDirectoryPath);
      setCaption('');
    }
  }, [postMoment]);

  const uriVideo = useTrimVideo();

  useEffect(() => {
    if (uriVideo === 'cancel') {
      console.log('cancel');

      setselectedMedia(null);
      navigation.setParams(undefined);
      return;
    }
    if (uriVideo) {
      setselectedMedia({uri: uriVideo, type: 'video'});
    }
  }, [uriVideo]);

  return (
    <View flex bg-black padding-12>
      <View row spread centerV>
        <Avatar
          source={{uri: userInfo?.photoUrl}}
          size={36}
          onPress={handleViewProfile}
        />
        <TouchableOpacity onPress={handleLogout}>
          <View
            padding-8
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.grey40,
            }}>
            <Icon
              assetGroup="icons"
              assetName="ic_logout"
              size={24}
              tintColor={Colors.grey40}
            />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        <PostForm
          selectedMedia={selectedMedia}
          isVideo={isVideo}
          onRemoveMedia={handleRemoveMedia}
          onSelectMedia={handleSelectMedia}
          caption={caption}
          setCaption={setCaption}
          isLoading={isLoading}
          onPost={handlePost}
          onSelectFriend={() => setVisibleSelectFriend(true)}
          localLoading={localLoading}
          selectedCount={
            optionSend === 'all'
              ? 0
              : optionSend === 'custom_list'
              ? customListFriends.length
              : selected.length
          }
        />
      </ScrollView>
      <SelectFriendDialog
        visible={visibleSelectFriend}
        onDismiss={() => {
          setVisibleSelectFriend(false);
        }}
      />
      <SelectMediaDialog
        visible={visibleSelectMedia}
        onDismiss={handleCancelSelectMedia}
        onConfirm={handleConfirmSelectMedia}
      />
    </View>
  );
};

export const navigationTo = (to: string, data?: any) => {
  navigation.navigate(to, data);
};

export const clearNavigation = () => {
  navigation.setParams(undefined);
};

export default HomeScreen;
