import React, {useCallback} from 'react';
import {FlatList, ToastAndroid} from 'react-native';
import {View, Text, Switch} from 'react-native-ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import RNFS from 'react-native-fs';

import Header from '../components/Header';
import MainButton from '../components/MainButton';
import {deleteAllMp4Files} from '../util/uploadVideo';
import {
  setUseCameraSetting,
  setOptionFriend,
  setUnlimitedTrimVideo,
  setTrySoftwareEncode,
} from '../redux/slice/setting.slice';
import {clearPostMoment} from '../redux/slice/postMoment.slice';
import {RootState} from '../redux/store';

const SettingScreen = () => {
  const dispatch = useDispatch();

  const {useCamera, optionFriend, unlimitedTrimVideo, trySoftwareEncode} =
    useSelector((state: RootState) => state.setting);

  const settingOptions = [
    {
      title: 'Sử dụng camera',
      value: useCamera,
      action: setUseCameraSetting,
    },
    {
      title: 'Nhiều lựa chọn bạn bè',
      value: optionFriend,
      action: setOptionFriend,
    },
    {
      title:
        'Cắt video nhiều hơn 7 giây \n(có thể làm giảm chất lượng rất nhiều)',
      value: unlimitedTrimVideo,
      action: setUnlimitedTrimVideo,
    },
    {
      title:
        'Sử dụng phần mềm mã hóa video \n(có thể 1 số thiết bị sẽ không xem được video)',
      value: trySoftwareEncode,
      action: setTrySoftwareEncode,
    },
  ];

  const handleToggle = useCallback(
    (value: boolean, action: (val: boolean) => any) => {
      dispatch(action(value));
    },
    [dispatch],
  );

  const handleClearCache = useCallback(async () => {
    let totalSize = 0;
    totalSize += (await deleteAllMp4Files(RNFS.DocumentDirectoryPath)) || 0;
    totalSize += (await deleteAllMp4Files(RNFS.CachesDirectoryPath)) || 0;

    dispatch(clearPostMoment());
    ToastAndroid.show(
      `Dọn dẹp bộ nhớ hoàn tất (${totalSize.toFixed(1)}Mb)`,
      ToastAndroid.SHORT,
    );
  }, [dispatch]);

  return (
    <View flex>
      <Header title="Setting" />
      <View bg-black flex paddingT-40 paddingH-12>
        <FlatList
          data={settingOptions}
          keyExtractor={item => item.title}
          renderItem={({item}) => (
            <>
              <View row spread paddingV-8>
                <Text white text70BL flexS>
                  {item.title}
                </Text>
                <Switch
                  value={item.value}
                  onValueChange={value => handleToggle(value, item.action)}
                />
              </View>
              <View height={1} bg-grey40 />
            </>
          )}
          ListFooterComponent={
            <View marginT-20>
              <MainButton onPress={handleClearCache} label="Xóa bộ nhớ đệm" />
            </View>
          }
        />
      </View>
    </View>
  );
};

export default SettingScreen;
